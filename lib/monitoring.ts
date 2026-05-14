import { prisma } from './prisma';
import { dispatchWebhook } from './webhooks';
import { sendUptimeAlert } from './mail';
import { validateSafeUrl } from './ssrf';

/**
 * [SaaS INFRA] - Health Checker
 * Performs an HTTP GET request to verify a site is UP and records latency.
 */
export async function performCheck(monitorId: string, url: string) {
  const startTime = Date.now();
  let status: 'UP' | 'DOWN' = 'UP';
  let latency = 0;
  let message: string | undefined = undefined;

  // 1. Perform the actual network probe (Isolated from DB)
  try {
    const safeUrl = await validateSafeUrl(url);
    const response = await fetch(safeUrl, {
      method: 'GET',
      headers: { 'User-Agent': 'NextOptimizerMonitor/1.0' },
      cache: 'no-store',
      // [PRODUCTION] Add a timeout to the fetch itself
      signal: AbortSignal.timeout(10000) 
    });

    latency = Date.now() - startTime;
    status = response.ok ? 'UP' : 'DOWN';
    if (!response.ok) {
      message = `HTTP ${response.status}: ${response.statusText}`;
    }
  } catch (error) {
    latency = Date.now() - startTime;
    status = 'DOWN';
    message = error instanceof Error ? error.message : 'Connection failed';
    console.error(`[MONITOR PROBE FAILED] ${url}: ${message}`);
  }

  // 2. Record the result to the database
  try {
    // Get current monitor to check for status change
    const monitor = await prisma.monitor.findUnique({
      where: { id: monitorId },
      include: { 
        user: { select: { name: true, email: true } }
      }
    });

    if (!monitor) return { status, latency, message };

    // Record the check
    await prisma.check.create({
      data: { monitorId, status, latency, message }
    });

    // Update monitor status only if it changed OR to update lastChecked
    const oldStatus = monitor.status;
    await prisma.monitor.update({
      where: { id: monitorId },
      data: { status, lastChecked: new Date() }
    });

    // 3. Dispatch Alerts on status change
    if (oldStatus !== status) {
      console.log(`[MONITOR CHANGE] ${monitor.name}: ${oldStatus} -> ${status}`);
      
      const event = status === 'DOWN' ? 'MONITOR_DOWN' : 'MONITOR_UP';
      await dispatchWebhook(monitor.userId, event, {
        monitorId, name: monitor.name, url, latency, message
      });

      if (monitor.user?.email) {
        sendUptimeAlert({
          email: monitor.user.email,
          userName: monitor.user.name || 'Developer',
          name: monitor.name,
          status,
          message,
          latency
        }).catch(console.error);
      }
    }

    return { status, latency, message };
  } catch (dbError) {
    // [CRITICAL] If the DB fails, we log it but we don't treat the TARGET as down
    console.error(`[MONITOR SYSTEM ERROR] Database failure while recording check for ${url}:`, dbError);
    return { status, latency, message: `System Error: ${dbError instanceof Error ? dbError.message : 'DB Failure'}` };
  }
}

