import React, { useState, useEffect } from 'react';
import { 
  Cpu, 
  Ruler, 
  Gauge, 
  Zap, 
  Box, 
  Settings, 
  PaintRoller, 
  AlertTriangle, 
  Layers, 
  Network,
  Github,
  Upload,
  CheckCircle2,
  AlertCircle,
  Loader2,
  LogOut,
  Video
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import axios from 'axios';

// --- Types ---
interface GitHubUser {
  login: string;
  avatar_url: string;
  html_url: string;
}

interface FileData {
  path: string;
  content: string;
}

interface DeployStatus {
  step: string;
  progress: number;
  status: 'idle' | 'processing' | 'success' | 'error';
  message?: string;
}

export default function App() {
  const [user, setUser] = useState<GitHubUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<FileData[]>([]);
  const [repoName, setRepoName] = useState('');
  const [deployStatus, setDeployStatus] = useState<DeployStatus>({
    step: 'IDLE',
    progress: 0,
    status: 'idle'
  });
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);

  useEffect(() => {
    fetchUser();
    
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS') {
        fetchUser();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const fetchUser = async () => {
    try {
      const res = await axios.get('/api/github/user');
      setUser(res.data);
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    const res = await axios.get('/api/auth/url');
    window.open(res.data.url, 'github_oauth', 'width=600,height=700');
  };

  const handleLogout = async () => {
    await axios.get('/api/github/logout');
    setUser(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList) return;

    const newFiles: FileData[] = [];
    const filesArray = Array.from(fileList);
    let processedCount = 0;

    filesArray.forEach((file: File) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        // Use relative path if webkitRelativePath is available
        const path = (file as any).webkitRelativePath || file.name;
        newFiles.push({ path, content });
        processedCount++;
        
        if (processedCount === filesArray.length) {
          setFiles(newFiles);
          // Auto-suggest repo name from folder name if available
          if ((file as any).webkitRelativePath) {
            const folderName = (file as any).webkitRelativePath.split('/')[0];
            setRepoName(folderName.toLowerCase().replace(/[^a-z0-9-_]/g, '-'));
          }
        }
      };
      reader.readAsText(file);
    });
  };

  const handleDeploy = async () => {
    if (!repoName || files.length === 0) return;

    setDeployStatus({ step: 'INITIALIZING', progress: 10, status: 'processing' });
    
    try {
      setDeployStatus({ step: 'CREATING REPOSITORY', progress: 30, status: 'processing' });
      const res = await axios.post('/api/github/deploy', { repoName, files });
      
      setDeployStatus({ step: 'UPLOADING ASSETS', progress: 70, status: 'processing' });
      
      setDeployStatus({ step: 'DEPLOYMENT COMPLETE', progress: 100, status: 'success' });
      setDeployedUrl(res.data.url);
    } catch (e: any) {
      setDeployStatus({ 
        step: 'ERROR', 
        progress: 100, 
        status: 'error', 
        message: e.response?.data?.error || 'Deployment failed' 
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans selection:bg-primary selection:text-background overflow-x-hidden">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full flex justify-between items-center px-6 h-16 bg-background/80 backdrop-blur-md z-50 border-b border-surface-high">
        <div className="flex items-center gap-3">
          <Cpu className="w-6 h-6 text-primary" />
          <h1 className="font-headline tracking-[0.05em] uppercase text-sm font-bold text-primary">KINETIC_MONOLITH_OS</h1>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              <img src={user.avatar_url} alt={user.login} className="w-8 h-8 rounded-full border border-primary/30" />
              <span className="text-xs font-headline font-medium hidden sm:inline">{user.login.toUpperCase()}</span>
              <button onClick={handleLogout} className="p-2 hover:bg-surface-high rounded-lg transition-colors text-on-surface-variant">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleLogin}
              className="flex items-center gap-2 px-4 py-2 bg-surface-high hover:bg-surface rounded-lg border border-primary/20 transition-all text-xs font-headline font-bold"
            >
              <Github className="w-4 h-4" />
              CONNECT_GITHUB
            </button>
          )}
        </div>
      </header>

      <main className="pt-16 pb-24 min-h-screen">
        {/* Hero Section */}
        <section className="relative w-full h-[400px] md:h-[500px] flex items-center justify-center overflow-hidden bg-surface-low">
          <div className="absolute inset-0 z-0 opacity-20">
            <img 
              alt="Technical Detail" 
              className="w-full h-full object-cover" 
              src="https://picsum.photos/seed/industrial/1920/1080?blur=4"
              referrerPolicy="no-referrer"
            />
          </div>
          
          <div className="relative z-10 w-full max-w-6xl px-8 flex flex-col items-start justify-center">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-2"
            >
              <span className="font-headline text-[10px] text-primary opacity-60 tracking-[0.2em]">UNIT_IDENTIFIER</span>
              <h2 className="text-5xl md:text-7xl font-headline font-bold text-on-surface tracking-tighter">TITAN 5000</h2>
              <div className="flex items-center gap-2 mt-2">
                <div className={`w-2 h-2 rounded-full ${user ? 'bg-primary animate-pulse shadow-[0_0_8px_#a3c9ff]' : 'bg-error shadow-[0_0_8px_#ffb4ab]'}`}></div>
                <span className="font-mono text-[10px] tracking-widest text-on-surface-variant uppercase">
                  {user ? 'SYSTEM_READY // OPERATIONAL' : 'SYSTEM_OFFLINE // AUTH_REQUIRED'}
                </span>
              </div>
            </motion.div>
          </div>

          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent"></div>
        </section>

        {/* Main Content Grid */}
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-8 -mt-20 relative z-20">
          
          {/* Left Column: Deployment Interface */}
          <div className="md:col-span-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard icon={<Ruler className="w-5 h-5" />} label="MAX_PAYLOAD" value="50" unit="MB" />
              <StatCard icon={<Gauge className="w-5 h-5" />} label="THROUGHPUT" value="120" unit="req/s" />
              <StatCard icon={<Zap className="w-5 h-5" />} label="LATENCY" value="45" unit="ms" />
            </div>

            <motion.div 
              layout
              className="bg-surface p-8 rounded-xl border border-primary/10 glow-primary"
            >
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div className="flex-1 space-y-2">
                  <h3 className="font-headline text-xl font-bold">DEPLOYMENT_MODULE</h3>
                  <p className="text-on-surface-variant text-sm max-w-md">
                    Initialize web deployment to GitHub Pages. Select a source directory containing your index.html and assets.
                  </p>
                </div>
                
                <div className="flex flex-col gap-4 w-full md:w-auto">
                  {!user ? (
                    <button 
                      onClick={handleLogin}
                      className="industrial-gradient px-8 py-4 rounded-lg text-background font-headline font-bold text-sm flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-95"
                    >
                      <Github className="w-5 h-5" />
                      AUTHORIZE_SYSTEM
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex flex-col gap-2">
                        <label className="font-mono text-[10px] text-primary uppercase tracking-widest">REPOSITORY_NAME</label>
                        <input 
                          type="text" 
                          value={repoName}
                          onChange={(e) => setRepoName(e.target.value)}
                          placeholder="my-awesome-site"
                          className="bg-surface-low border border-primary/20 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                      </div>
                      
                      <div className="flex gap-3">
                        <label className="flex-1 cursor-pointer bg-surface-high hover:bg-surface-high/80 px-6 py-3 rounded-lg border border-primary/20 text-on-surface font-headline font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95">
                          <Upload className="w-4 h-4" />
                          SELECT_FOLDER
                          <input 
                            type="file" 
                            className="hidden" 
                            // @ts-ignore
                            webkitdirectory="" 
                            directory="" 
                            multiple 
                            onChange={handleFileChange}
                          />
                        </label>
                        
                        <button 
                          onClick={handleDeploy}
                          disabled={!repoName || files.length === 0 || deployStatus.status === 'processing'}
                          className="flex-1 industrial-gradient px-6 py-3 rounded-lg text-background font-headline font-bold text-xs flex items-center justify-center gap-2 hover:brightness-110 transition-all active:scale-95 disabled:opacity-50 disabled:grayscale"
                        >
                          <Layers className="w-4 h-4" />
                          EXECUTE_DEPLOY
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Deployment Progress Telemetry */}
              <AnimatePresence>
                {deployStatus.status !== 'idle' && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-8 pt-8 border-t border-primary/10 space-y-4"
                  >
                    <div className="flex justify-between items-end">
                      <div className="space-y-1">
                        <span className="font-mono text-[10px] text-primary uppercase tracking-widest">CURRENT_OPERATION</span>
                        <p className="font-headline font-bold text-lg">{deployStatus.step}</p>
                      </div>
                      <span className="font-mono text-xs text-primary">{deployStatus.progress}%</span>
                    </div>
                    
                    <div className="w-full h-1 bg-surface-high rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${deployStatus.progress}%` }}
                        className={`h-full ${deployStatus.status === 'error' ? 'bg-error' : 'industrial-gradient'}`}
                      />
                    </div>

                    {deployStatus.status === 'success' && deployedUrl && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 bg-primary/10 border border-primary/30 rounded-lg flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                          <div>
                            <p className="text-xs font-bold text-primary uppercase">DEPLOYMENT_SUCCESSFUL</p>
                            <a href={deployedUrl} target="_blank" rel="noreferrer" className="text-sm underline hover:text-primary transition-colors">
                              {deployedUrl}
                            </a>
                          </div>
                        </div>
                        <Box className="w-6 h-6 text-primary animate-pulse" />
                      </motion.div>
                    )}

                    {deployStatus.status === 'error' && (
                      <div className="p-4 bg-error/10 border border-error/30 rounded-lg flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-error" />
                        <div>
                          <p className="text-xs font-bold text-error uppercase">SYSTEM_FAILURE</p>
                          <p className="text-sm text-on-surface-variant">{deployStatus.message}</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* File List Telemetry */}
            {files.length > 0 && (
              <div className="bg-surface-low p-6 rounded-xl border border-primary/5">
                <h4 className="font-headline text-xs font-bold mb-4 text-on-surface-variant uppercase tracking-widest">ASSET_MANIFEST ({files.length} FILES)</h4>
                <div className="max-h-40 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                  {files.map((file, i) => (
                    <div key={i} className="flex items-center justify-between text-[10px] font-mono p-2 bg-background/50 rounded border border-primary/5">
                      <span className="truncate max-w-[70%]">{file.path}</span>
                      <span className="text-primary/50">{(file.content.length / 1024).toFixed(2)} KB</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Sidebar */}
          <div className="md:col-span-4 space-y-6">
            <div className="bg-surface-high p-6 rounded-xl border border-primary/10">
              <h4 className="font-headline text-[10px] uppercase tracking-[0.3em] text-primary mb-4">SYSTEM_STATUS</h4>
              <div className="space-y-3">
                <StatusItem icon={<Settings className="w-4 h-4" />} label="CORE_ENGINE" status="98% HEALTH" />
                <StatusItem icon={<PaintRoller className="w-4 h-4" />} label="IO_MODULE" status="OPTIMAL" />
                <StatusItem icon={<AlertTriangle className="w-4 h-4" />} label="AUTH_GATE" status={user ? 'VERIFIED' : 'PENDING'} warning={!user} />
              </div>
            </div>

            <div className="relative overflow-hidden group rounded-xl h-48 border border-primary/10">
              <img 
                alt="Maintenance Log" 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                src="https://picsum.photos/seed/tech/600/400"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent p-6 flex flex-col justify-end">
                <h4 className="font-headline font-bold text-lg">MAINTENANCE_LOG</h4>
                <p className="text-xs text-on-surface-variant">Access full deployment history and system logs.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 pb-6 pt-3 bg-background/80 backdrop-blur-xl border-t border-surface-high z-50">
        <NavItem icon={<Box className="w-5 h-5" />} label="SHOWROOM" />
        <NavItem icon={<Layers className="w-5 h-5" />} label="DETAIL" active />
        <NavItem icon={<Network className="w-5 h-5" />} label="HUB" />
      </nav>
    </div>
  );
}

// --- Sub-components ---

function StatCard({ icon, label, value, unit }: { icon: React.ReactNode, label: string, value: string, unit: string }) {
  return (
    <div className="bg-surface-low p-6 rounded-xl border-b border-primary/10 flex flex-col justify-between h-36 hover:bg-surface transition-colors group">
      <div className="text-primary/60 group-hover:text-primary transition-colors">
        {icon}
        <h3 className="font-headline text-[10px] uppercase tracking-[0.2em] mt-2">{label}</h3>
      </div>
      <p className="font-headline text-2xl font-bold">
        {value}<span className="text-sm font-normal text-on-surface-variant ml-1">{unit}</span>
      </p>
    </div>
  );
}

function StatusItem({ icon, label, status, warning }: { icon: React.ReactNode, label: string, status: string, warning?: boolean }) {
  return (
    <div className={`flex items-center justify-between p-3 bg-background/50 rounded border-l-2 ${warning ? 'border-secondary' : 'border-primary/30'}`}>
      <div className="flex items-center gap-3">
        <span className={warning ? 'text-secondary' : 'text-on-surface-variant'}>{icon}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <span className={`text-[10px] font-bold ${warning ? 'text-secondary' : 'text-primary'}`}>{status}</span>
    </div>
  );
}

function NavItem({ icon, label, active }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <a 
      href="#" 
      className={`flex flex-col items-center justify-center transition-all active:translate-y-0.5 duration-150 ${
        active 
          ? 'text-primary bg-surface-high rounded-xl py-2 px-4 glow-primary' 
          : 'text-on-surface-variant opacity-40 hover:opacity-100'
      }`}
    >
      {icon}
      <span className="font-headline text-[9px] font-bold tracking-widest uppercase mt-1">{label}</span>
    </a>
  );
}
