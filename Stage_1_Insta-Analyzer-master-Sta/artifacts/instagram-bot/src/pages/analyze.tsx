import { useState } from "react";
import { Search, AlertTriangle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAnalyze } from "@/hooks/use-analytics";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProfileCard } from "@/components/profile-card";

export default function Analyze() {
  const [username, setUsername] = useState("");
  const analyzeMutation = useAnalyze();

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    // Remove @ if user included it
    const cleanUsername = username.replace(/^@/, '').trim();
    analyzeMutation.mutate({ data: { username: cleanUsername } });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-12">
      
      <div className="text-center space-y-4">
        <h1 className="text-4xl sm:text-5xl font-display font-bold">
          Manual <span className="text-gradient-ig">Analysis</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Enter any public Instagram username to instantly fetch rich statistics, engagement rates, and profile details without using the Telegram bot.
        </p>
      </div>

      <motion.form 
        onSubmit={handleAnalyze}
        className="relative max-w-2xl mx-auto group"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="absolute -inset-1 bg-gradient-ig rounded-[1.5rem] blur opacity-25 group-focus-within:opacity-50 transition duration-1000 group-hover:duration-200"></div>
        <div className="relative flex items-center bg-card rounded-2xl border border-white/10 shadow-2xl p-2">
          <div className="pl-4 pr-2 text-muted-foreground">@</div>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="instagram_username"
            className="flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0 px-0 h-14 text-lg font-medium"
            disabled={analyzeMutation.isPending}
          />
          <Button 
            type="submit" 
            variant="gradient" 
            size="lg" 
            disabled={analyzeMutation.isPending || !username.trim()}
            className="rounded-xl ml-2 w-32"
          >
            {analyzeMutation.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Search className="w-5 h-5 mr-2" />
                Analyze
              </>
            )}
          </Button>
        </div>
      </motion.form>

      <AnimatePresence mode="wait">
        {analyzeMutation.error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-destructive/10 border border-destructive/20 text-destructive-foreground p-6 rounded-2xl flex items-start gap-4 max-w-2xl mx-auto"
          >
            <AlertTriangle className="w-6 h-6 text-destructive shrink-0 mt-1" />
            <div>
              <h4 className="font-bold text-lg text-destructive mb-1">Analysis Failed</h4>
              <p className="text-destructive/80">
                {(analyzeMutation.error as any)?.message || "Could not fetch profile data. Make sure the username is correct and the RapidAPI key is configured properly."}
              </p>
            </div>
          </motion.div>
        )}

        {analyzeMutation.data && (
          <ProfileCard key={analyzeMutation.data.username} profile={analyzeMutation.data} />
        )}
      </AnimatePresence>
    </div>
  );
}
