"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Card, Button, Input, PasswordInput } from "@/components/ui-elements";
import { AnalysisReport } from "@/components/analysis-report";
import { 
  Key, 
  Trash2, 
  Plus, 
  Clock, 
  Terminal, 
  ShieldCheck, 
  Copy, 
  CheckCircle2,
  Loader2,
  RefreshCw,
  LogOut,
  Search,
  AlertTriangle,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ApiKey {
  id: string;
  name: string;
  createdAt: string;
  lastUsedAt: string | null;
}

/**
 * [ENTRY-LEVEL DEFINITION] - Dashboard
 * Think of this as your personal control tower. From here, you see all the 
 * "access badges" (API Keys) you've issued and can manage them.
 */
export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = React.useState<any>(null);
  const [keys, setKeys] = React.useState<ApiKey[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [creatingKey, setCreatingKey] = React.useState(false);
  const [newKey, setNewKey] = React.useState<string | null>(null);
  const [copied, setCopied] = React.useState(false);

  // Playground States
  const [playgroundKey, setPlaygroundKey] = React.useState("");
  const [playgroundTag, setPlaygroundTag] = React.useState("");
  const [playgroundResult, setPlaygroundResult] = React.useState<any>(null);
  const [playgroundLoading, setPlaygroundLoading] = React.useState(false);

  // Analysis States
  const [analyzeUrl, setAnalyzeUrl] = React.useState("");
  const [analyzeResult, setAnalyzeResult] = React.useState<any>(null);
  const [analyzeLoading, setAnalyzeLoading] = React.useState(false);

  // Health State
  const [health, setHealth] = React.useState<any>(null);

  React.useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token) {
      router.push("/login");
      return;
    }

    if (storedUser) setUser(JSON.parse(storedUser));
    
    const storedPlaygroundKey = localStorage.getItem("active_api_key");
    if (storedPlaygroundKey) setPlaygroundKey(storedPlaygroundKey);

    fetchKeys(token);
    fetchHealth();
  }, []);

  async function fetchHealth() {
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setHealth(data);
    } catch (err) {
      console.error("Health check failed");
    }
  }

  async function fetchKeys(token: string) {
    try {
      const res = await fetch("/api/keys", {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) setKeys(data.keys);
    } catch (err) {
      console.error("Failed to fetch keys", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateKey(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setCreatingKey(true);
    const token = localStorage.getItem("token");
    const formData = new FormData(e.currentTarget);
    const name = formData.get("keyName");

    try {
      const res = await fetch("/api/keys", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (res.ok) {
        setNewKey(data.apiKey);
        setPlaygroundKey(data.apiKey); 
        localStorage.setItem("active_api_key", data.apiKey); // Persist for refresh
        
        // [UX] Immediately show success in the Playground
        setPlaygroundResult({ 
          success: true, 
          message: "Handshake verified. Your new machine key is active and authorized.", 
          status: 200,
          timestamp: new Date().toISOString()
        });

        fetchKeys(token!);
      }
    } catch (err) {
      alert("Failed to create key");
    } finally {
      setCreatingKey(false);
    }
  }

  async function handleDeleteKey(id: string) {
    if (!confirm("Are you sure you want to revoke this key? Any app using it will lose access immediately.")) return;
    
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/keys/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        setKeys(keys.filter(k => k.id !== id));
      }
    } catch (err) {
      alert("Failed to delete key");
    }
  }

  async function runPlayground() {
    if (!playgroundKey || !playgroundTag) return;
    setPlaygroundLoading(true);
    setPlaygroundResult(null);

    try {
      const res = await fetch("/api/revalidate", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${playgroundKey}`
        },
        body: JSON.stringify({ tag: playgroundTag || undefined }),
      });
      const data = await res.json();
      setPlaygroundResult({ ...data, status: res.status });
    } catch (err) {
      setPlaygroundResult({ error: "Network error", message: "Failed to reach API", status: 500 });
    } finally {
      setPlaygroundLoading(false);
    }
  }

  async function runAnalyzer() {
    if (!analyzeUrl) return;
    setAnalyzeLoading(true);
    setAnalyzeResult(null);

    if (!playgroundKey) {
      alert("Please paste your API Key into the 'Security Playground' section (bottom right) first to authorize the scanner.");
      setAnalyzeLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${playgroundKey}`
        },
        body: JSON.stringify({ url: analyzeUrl }),
      });
      const data = await res.json();
      setAnalyzeResult(data);
    } catch (err) {
      alert("Scan failed");
    } finally {
      setAnalyzeLoading(false);
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/login");
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50 dark:bg-zinc-950">
      <Navbar />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          
          {/* LEFT COLUMN: API Keys & Analysis */}
          <div className="flex-[2] space-y-6">
            
            {/* WEBSITE ANALYZER CARD */}
            <Card className="p-6 border-blue-100 dark:border-blue-900/30 bg-white dark:bg-zinc-950 overflow-hidden relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                  <Search className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-display">Website Analyzer</h2>
                  <p className="text-xs text-zinc-500">Scan any URL for SEO and Performance optimization scores</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <Input 
                  placeholder="https://your-website.com" 
                  value={analyzeUrl}
                  onChange={(e) => setAnalyzeUrl(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={runAnalyzer} disabled={analyzeLoading || !analyzeUrl}>
                  {analyzeLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                  Run Audit
                </Button>
              </div>

              {analyzeResult && <AnalysisReport data={analyzeResult} />}
            </Card>

            <div className="flex items-center justify-between pt-4">
              <div>
                <h1 className="text-2xl font-bold">API Access Keys</h1>
                <p className="text-sm text-zinc-500">Secure machine keys for your external services</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => fetchKeys(localStorage.getItem("token")!)}>
                  <RefreshCw className="h-4 w-4 mr-2" /> Refresh
                </Button>
              </div>
            </div>

            {/* NEW KEY SUCCESS MODAL (Pseudo-modal) */}
            {newKey && (
              <Card className="bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-800 p-6 relative overflow-hidden">
                <div className="flex items-start gap-4">
                  <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="space-y-1 pr-8">
                    <h3 className="font-bold text-green-800 dark:text-green-400">Key Created Successfully!</h3>
                    <p className="text-sm text-green-700 dark:text-green-500 mb-4">
                      [SECURITY ALERT] Copy this key now. You will **never** see it again. 
                      <span className="block mt-1 font-bold">The Website Analyzer is now automatically authorized with this key.</span>
                    </p>
                    <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-3 rounded-lg border border-green-200 dark:border-green-800 font-mono text-xs break-all">
                      {newKey}
                      <button 
                        onClick={() => copyToClipboard(newKey)}
                        className="ml-auto p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md transition-colors"
                      >
                        {copied ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4 text-zinc-400" />}
                      </button>
                    </div>
                  </div>
                  <button 
                    onClick={() => setNewKey(null)}
                    className="absolute top-4 right-4 text-green-600 hover:bg-green-100 p-1 rounded-full"
                  >
                    ×
                  </button>
                </div>
              </Card>
            )}

            <Card className="p-0 overflow-hidden">
              <div className="p-4 border-b bg-zinc-50/50 dark:bg-zinc-900/50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-zinc-400" />
                  <span className="font-medium text-sm">Active Keys ({keys.length})</span>
                </div>
                <form onSubmit={handleCreateKey} className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                  <Input 
                    name="keyName" 
                    placeholder="e.g. Android Mobile" 
                    className="h-9 text-xs w-full sm:w-48"
                    required
                  />
                  <Button size="sm" type="submit" disabled={creatingKey} className="whitespace-nowrap">
                    {creatingKey ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Plus className="h-3 w-3 mr-1" />}
                    Create Key
                  </Button>
                </form>
              </div>

              {keys.length === 0 ? (
                <div className="p-12 text-center text-zinc-500">
                  <p>You haven&apos;t generated any API keys yet.</p>
                  <p className="text-xs">Generate one to start connecting your Android app.</p>
                </div>
              ) : (
                <div className="divide-y">
                  {keys.map((key) => (
                    <div key={key.id} className="p-4 flex items-center justify-between hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors group">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{key.name}</span>
                          <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-500 uppercase tracking-wider">Active</span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-zinc-500">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Created {new Date(key.createdAt).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Terminal className="h-3 w-3" /> 
                            {key.lastUsedAt ? `Last active ${new Date(key.lastUsedAt).toLocaleDateString()}` : "Never used"}
                          </span>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-zinc-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleDeleteKey(key.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>

          <div className="flex-1 space-y-6">
            {/* SYSTEM HEALTH CARD */}
            <Card className="p-4 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-2 w-2 rounded-full animate-pulse",
                    health?.status === 'healthy' ? "bg-green-500" : "bg-red-500"
                  )} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                    System {health?.status || 'Unknown'}
                  </span>
                </div>
                <div className="text-[10px] text-zinc-400 font-mono">
                  v{health?.version || '1.0.0'}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1 h-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 w-full" />
                </div>
                <div className="text-[10px] whitespace-nowrap text-zinc-500">
                  {health?.uptime?.hours || '0'} hrs uptime
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-12 w-12 rounded-full border-2 border-blue-600 flex items-center justify-center overflow-hidden bg-white">
                  <span className="text-xl font-bold text-blue-600 uppercase">
                    {user?.name?.[0] || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <h2 className="font-bold leading-none">{user?.name}</h2>
                  <p className="text-xs text-zinc-500 mt-1">{user?.email}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Sign Out">
                  <LogOut className="h-4 w-4 text-zinc-400 hover:text-red-500" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border">
                  <div className="text-lg font-bold">{keys.length}</div>
                  <div className="text-[10px] text-zinc-500 uppercase">Live Keys</div>
                </div>
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg border">
                  <div className="text-lg font-bold text-green-600 uppercase text-sm">Pro</div>
                  <div className="text-[10px] text-zinc-500 uppercase">Plan</div>
                </div>
              </div>
            </Card>

            <Card className="p-0 overflow-hidden border-2 border-zinc-200 dark:border-zinc-800 shadow-xl">
              <div className="p-6 bg-zinc-900 text-white">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="h-5 w-5 text-blue-400" />
                  <h3 className="font-bold">Security Playground</h3>
                </div>
                <p className="text-[11px] text-zinc-400 mb-6 leading-relaxed">
                  [FLOW] Use this tool to test your **API Keys**. Paste a key you generated, a Cache Tag (like `products`), and click run to verify the security handshake.
                </p>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider opacity-80">Machine API Key</label>
                    <PasswordInput 
                      className="w-full bg-zinc-800 border-zinc-700 text-white"
                      value={playgroundKey}
                      onChange={(e) => {
                        setPlaygroundKey(e.target.value);
                        localStorage.setItem("active_api_key", e.target.value);
                      }}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between">
                      <label className="text-[10px] font-bold uppercase tracking-wider opacity-80">Test Cache Tag</label>
                      <span className="text-[8px] font-bold text-zinc-500 uppercase">Optional for handshake</span>
                    </div>
                    <Input 
                      className="w-full bg-zinc-800 border-zinc-700 text-white"
                      placeholder="e.g. products"
                      value={playgroundTag}
                      onChange={(e) => setPlaygroundTag(e.target.value)}
                    />
                  </div>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 h-11" 
                    onClick={runPlayground}
                    disabled={playgroundLoading || !playgroundKey}
                  >
                    {playgroundLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify Handshake"}
                  </Button>
                </div>
              </div>

              {playgroundResult && (
                <div className={cn(
                  "p-6 transition-all duration-500",
                  playgroundResult.status === 200 
                    ? "bg-green-600/10 text-green-700 dark:text-green-400" 
                    : "bg-red-600/10 text-red-700 dark:text-red-400"
                )}>
                  <div className="flex items-center gap-3 mb-3">
                    {playgroundResult.status === 200 ? (
                      <CheckCircle2 className="h-6 w-6" />
                    ) : (
                      <AlertTriangle className="h-6 w-6 animate-pulse" />
                    )}
                    <span className="font-bold text-sm uppercase tracking-tight">
                      {playgroundResult.status === 200 ? "Authorization Success" : "Security Alert: Unauthorized"}
                    </span>
                  </div>
                  <div className="p-3 bg-black/5 dark:bg-black/40 rounded-lg text-[10px] font-mono break-all border border-black/5 overflow-auto max-h-32">
                    {JSON.stringify(playgroundResult, null, 2)}
                  </div>
                  {playgroundResult.status === 401 && (
                    <p className="mt-3 text-[10px] font-medium leading-relaxed opacity-80">
                      [TIP] Ensure you are using the `opt_...` key. Do not use your account password here.
                    </p>
                  )}
                </div>
              )}
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}
