import { motion } from "framer-motion";
import { useBotPolling } from "@/hooks/use-bot";
import { ExternalLink, MessageCircle, Hash, Search, Info, Zap, Send, Copy, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState } from "react";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={handleCopy}
      className="ml-2 text-muted-foreground hover:text-foreground transition-colors"
      title="Copy"
    >
      {copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
    </button>
  );
}

function CommandBlock({ cmd, desc }: { cmd: string; desc: string }) {
  return (
    <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/10 group">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <code className="text-ig-pink font-mono font-bold text-sm">{cmd}</code>
          <CopyButton text={cmd} />
        </div>
        <p className="text-muted-foreground text-sm mt-1">{desc}</p>
      </div>
    </div>
  );
}

function Step({ n, title, desc }: { n: number; title: string; desc: React.ReactNode }) {
  return (
    <motion.div
      className="flex gap-4"
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: n * 0.1 }}
    >
      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-ig flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-ig-purple/30">
        {n}
      </div>
      <div className="pt-1">
        <h4 className="font-semibold text-foreground mb-1">{title}</h4>
        <div className="text-muted-foreground text-sm leading-relaxed">{desc}</div>
      </div>
    </motion.div>
  );
}

export default function Guide() {
  const { data: botStatus } = useBotPolling();
  const botUsername = botStatus?.botUsername ?? "Instaanalyserbot";
  const botLink = `https://t.me/${botUsername}`;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 24 } },
  };

  return (
    <motion.div
      className="space-y-8 pb-12 max-w-4xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Hero */}
      <motion.div variants={itemVariants} className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-muted-foreground mb-2">
          <Zap className="w-4 h-4 text-ig-orange" />
          Single command. Full analysis.
        </div>
        <h1 className="text-4xl sm:text-5xl font-display font-bold">
          How to Use the <span className="text-gradient-ig">Bot</span>
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Find the bot on Telegram, send one command, and get a complete Instagram profile report instantly.
        </p>
      </motion.div>

      {/* Find & Open Bot */}
      <motion.div variants={itemVariants}>
        <Card className="border-ig-purple/30 bg-gradient-to-br from-ig-purple/10 to-ig-pink/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Send className="w-5 h-5 text-ig-pink" />
              Step 1 — Find the Bot on Telegram
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Search for the bot username in Telegram, or tap the link below to open it directly.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Bot Username</p>
                <div className="flex items-center gap-2">
                  <code className="text-lg font-bold text-foreground">@{botUsername}</code>
                  <CopyButton text={`@${botUsername}`} />
                </div>
                <p className="text-xs text-muted-foreground">Search this in Telegram's search bar</p>
              </div>

              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2">
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Direct Link</p>
                <code className="text-sm font-medium text-ig-pink break-all">t.me/{botUsername}</code>
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    className="bg-gradient-ig hover:opacity-90 text-white border-0"
                    onClick={() => window.open(botLink, "_blank")}
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    Open Bot
                  </Button>
                  <CopyButton text={botLink} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${botStatus?.running ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
              <p className="text-sm text-muted-foreground">
                Bot is currently <strong className={botStatus?.running ? "text-green-400" : "text-red-400"}>{botStatus?.running ? "online and ready" : "offline"}</strong>
                {botStatus?.running && botStatus?.uptime ? ` — up for ${Math.floor(botStatus.uptime / 60)}m` : ""}
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Start Steps */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Zap className="w-5 h-5 text-ig-orange" />
              Step 2 — Quick Start (30 seconds)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Step n={1} title='Open the bot & tap "Start"'
              desc={<>Tap <strong className="text-foreground">Open</strong> in Telegram, then tap <code className="bg-white/10 px-1.5 py-0.5 rounded text-xs">/start</code> or the START button. The bot will greet you with a welcome message.</>}
            />
            <Step n={2} title="Send an Instagram username"
              desc={<>Type any Instagram username and hit send. You can use any of these formats:<br/>
                <div className="mt-2 space-y-1">
                  <code className="block bg-white/10 px-3 py-1.5 rounded text-xs">/analyze cristiano</code>
                  <code className="block bg-white/10 px-3 py-1.5 rounded text-xs">/analyze @cristiano</code>
                  <code className="block bg-white/10 px-3 py-1.5 rounded text-xs">cristiano</code>
                </div>
              </>}
            />
            <Step n={3} title="Get your analysis instantly"
              desc="The bot fetches the profile and replies with a full analysis — followers, engagement rate, account type, bio, and more. All in one message."
            />
          </CardContent>
        </Card>
      </motion.div>

      {/* Commands Reference */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Hash className="w-5 h-5 text-ig-purple" />
              All Commands
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <CommandBlock cmd="/start" desc="Welcome message with full instructions and quick-start guide." />
            <CommandBlock cmd="/analyze <username>" desc="Analyze any public Instagram profile. Returns followers, engagement rate, account type, bio and more." />
            <CommandBlock cmd="/help" desc="Detailed help guide with all commands and usage examples." />
            <CommandBlock cmd="/about" desc="Information about the bot, its features, and how to share it." />
          </CardContent>
        </Card>
      </motion.div>

      {/* What you get */}
      <motion.div variants={itemVariants}>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Search className="w-5 h-5 text-ig-pink" />
              What You Get in Every Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                ["👥", "Followers count"],
                ["🔄", "Following count"],
                ["📸", "Total posts"],
                ["📊", "Engagement rate (%)"],
                ["❤️", "Average likes per post"],
                ["💬", "Average comments per post"],
                ["✅", "Verified status"],
                ["🔒", "Private/public account"],
                ["🏢", "Business or personal"],
                ["🏷️", "Account category"],
                ["📝", "Bio text"],
                ["🔗", "Website/external link"],
              ].map(([icon, label]) => (
                <div key={label} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-xl">{icon}</span>
                  <span className="text-sm text-muted-foreground">{label}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Notes */}
      <motion.div variants={itemVariants}>
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Info className="w-5 h-5 text-yellow-400" />
              Important Notes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              ["✅ Public accounts", "Works fully — all stats, engagement and bio."],
              ["🔒 Private accounts", "Shows basic info (followers, following) but limited data."],
              ["❌ Non-existent accounts", "The bot will notify you that the account wasn't found."],
              ["⏱ Rate limits", "If you hit limits, wait 30 seconds and try again."],
              ["📱 Works everywhere", "Use from Telegram on mobile, desktop, or web."],
            ].map(([title, desc]) => (
              <div key={String(title)} className="flex gap-3">
                <span className="shrink-0 text-sm font-semibold text-foreground">{title}</span>
                <span className="text-sm text-muted-foreground">{desc}</span>
              </div>
            ))}
          </CardContent>
        </Card>
      </motion.div>

      {/* Share */}
      <motion.div variants={itemVariants}>
        <div className="text-center p-8 rounded-2xl bg-gradient-to-br from-ig-purple/20 to-ig-pink/20 border border-white/10 space-y-4">
          <MessageCircle className="w-10 h-10 text-ig-pink mx-auto" />
          <h3 className="text-2xl font-display font-bold">Share the Bot</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Know someone who needs Instagram analytics? Share the bot link with them.
          </p>
          <div className="flex items-center justify-center gap-3">
            <code className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 font-medium">
              t.me/{botUsername}
            </code>
            <CopyButton text={botLink} />
          </div>
          <Button
            className="bg-gradient-ig hover:opacity-90 text-white border-0"
            onClick={() => window.open(botLink, "_blank")}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Bot in Telegram
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
