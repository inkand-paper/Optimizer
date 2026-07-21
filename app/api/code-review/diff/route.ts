import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokenFromRequest } from '@/lib/auth';

type IssueEntry = {
  file: string;
  severity: string;
  category: string;
  message: string;
};

type ReviewResult = {
  files?: Array<{
    path: string;
    issues?: Array<{
      severity: string;
      category: string;
      message: string;
    }>;
  }>;
};

function extractIssues(result: ReviewResult): IssueEntry[] {
  if (!result?.files) return [];
  const issues: IssueEntry[] = [];
  for (const file of result.files) {
    for (const issue of file.issues || []) {
      issues.push({
        file: file.path,
        severity: issue.severity,
        category: issue.category,
        message: issue.message,
      });
    }
  }
  return issues;
}

function issueKey(issue: IssueEntry): string {
  return `${issue.file}::${issue.category}::${issue.message}`;
}

// GET /api/code-review/diff?reviewId=xxx
// Returns a diff between the given review and its previousReviewId
export async function GET(req: NextRequest) {
  try {
    const token = await getTokenFromRequest(req);
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const reviewId = searchParams.get('reviewId');
    if (!reviewId) return NextResponse.json({ error: 'reviewId is required' }, { status: 400 });

    const review = await prisma.codeReview.findUnique({
      where: { id: reviewId },
      select: {
        id: true,
        userId: true,
        repoName: true,
        score: true,
        previousReviewId: true,
        previousScore: true,
        result: true,
        createdAt: true,
      },
    });

    if (!review) return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    if (review.userId !== token.userId && token.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!review.previousReviewId) {
      return NextResponse.json({ hasDiff: false, reason: 'No previous audit found for this repository.' });
    }

    const previousReview = await prisma.codeReview.findUnique({
      where: { id: review.previousReviewId },
      select: { id: true, score: true, result: true, createdAt: true },
    });

    if (!previousReview) {
      return NextResponse.json({ hasDiff: false, reason: 'Previous audit no longer available.' });
    }

    // Extract issues from both reviews
    const currentIssues = extractIssues(review.result as ReviewResult);
    const previousIssues = extractIssues(previousReview.result as ReviewResult);

    const currentKeys = new Set(currentIssues.map(issueKey));
    const previousKeys = new Set(previousIssues.map(issueKey));

    // New issues: in current but not previous
    const newIssues = currentIssues.filter(i => !previousKeys.has(issueKey(i)));
    // Fixed issues: in previous but not current
    const fixedIssues = previousIssues.filter(i => !currentKeys.has(issueKey(i)));

    const scoreDelta = (review.score ?? 0) - (previousReview.score ?? 0);

    return NextResponse.json({
      hasDiff: true,
      currentScore: review.score,
      previousScore: previousReview.score,
      scoreDelta,
      grade: scoreDelta > 0 ? 'improved' : scoreDelta < 0 ? 'regressed' : 'unchanged',
      newIssues,
      fixedIssues,
      newIssuesCount: newIssues.length,
      fixedIssuesCount: fixedIssues.length,
      previousAuditDate: previousReview.createdAt,
      currentAuditDate: review.createdAt,
    });

  } catch (error) {
    console.error('GET /api/code-review/diff error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
