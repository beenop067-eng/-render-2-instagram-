import { Link, useLocation } from "wouter";
import { motion } from "framer-motion";
import { LayoutDashboard, Search, Bot, Activity, Menu, X, BookOpen, ExternalLink } from "lucide-react";
import { useBotPolling } from "@/hooks/use-bot";
import { cn } from "@/lib/utils";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analyze", label: "Analyze Profile", icon: Search },
  { href: "/guide", label: "Bot Guide & Setup", icon: BookOpen },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { data: botStatus } = useBotPolling();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isRunning = botStatus?.running ?? false;

  return (
    <div className="min-h-screen bg-background text-foreground flex overflow-hidden relative selection:bg-ig-purple/30">
      {/* Background Effect */}
      <div className="absolute inset-0 pointer-events-none opacity-40 z-0">
        <img 
          src={`${import.meta.env.BASE_URL}images/hero-mesh.png`} 
          alt="Background mesh" 
          className="w-full h-full object-cover mix-blend-screen"
        />
        <div className="absolute inset-0 bg-background/80 backdrop-blur-[100px]" />
      </div>

      {/* Sidebar */}
      <aside className={cn(
        "fixed md:static inset-y-0 left-0 z-50 w-72 bg-card/80 backdrop-blur-2xl border-r border-white/5 flex flex-col transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-ig flex items-center justify-center shadow-lg shadow-ig-purple/30">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-tight">InstaBot</h1>
              <p className="text-xs text-muted-foreground">Analyzer Dashboard</p>
            </div>
          </div>
          <button className="md:hidden text-muted-foreground hover:text-foreground" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {NAV_ITEMS.map((item) => {
            const isActive = location === item.href;
            return (
              <Link key={item.href} href={item.href} className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                isActive ? "text-white" : "text-muted-foreground hover:text-foreground hover:bg-white/5"
              )} onClick={() => setIsMobileMenuOpen(false)}>
                {isActive && (
                  <motion.div
                    layoutId="active-nav"
                    className="absolute inset-0 bg-white/10 border border-white/10 rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  />
                )}
                <item.icon className={cn("w-5 h-5 relative z-10 transition-colors", isActive ? "text-ig-pink" : "")} />
                <span className="font-medium relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto space-y-3">
          <div className="glass-panel p-4 rounded-xl flex items-center gap-4">
            <div className="relative flex h-3 w-3">
              {isRunning && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>}
              <span className={cn("relative inline-flex rounded-full h-3 w-3", isRunning ? "bg-green-500" : "bg-red-500")}></span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{isRunning ? "Bot is Running" : "Bot is Stopped"}</p>
              {botStatus?.botUsername && <p className="text-xs text-muted-foreground">@{botStatus.botUsername}</p>}
            </div>
          </div>
          {botStatus?.botUsername && (
            <a
              href={`https://t.me/${botStatus.botUsername}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl bg-gradient-ig text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <Bot className="w-4 h-4" />
              Open Bot in Telegram
              <ExternalLink className="w-3.5 h-3.5 ml-auto" />
            </a>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col relative z-10 h-screen overflow-hidden">
        <header className="h-20 border-b border-white/5 bg-background/50 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-foreground" onClick={() => setIsMobileMenuOpen(true)}>
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="font-display font-semibold text-xl capitalize hidden sm:block">
              {location === "/" ? "Dashboard Overview" : location.replace("/", "")}
            </h2>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium">
              <Activity className="w-4 h-4 text-ig-orange" />
              Live Mode
            </div>
          </div>
        </header>
        
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </div>
      </main>

      {/* Overlay for mobile sidebar */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
