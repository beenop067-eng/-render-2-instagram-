import { motion } from "framer-motion";
import { format } from "date-fns";
import { Play, Square, Hash, Users, Target, Activity, CheckCircle, AlertCircle } from "lucide-react";
import { useBotPolling, useBotControls } from "@/hooks/use-bot";
import { useDashboardStats, useRecentAnalyses } from "@/hooks/use-analytics";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatNumber, formatDuration } from "@/lib/utils";
import type { AnalysisRecord } from "@workspace/api-client-react";

export default function Dashboard() {
  const { data: botStatus, isLoading: botLoading } = useBotPolling();
  const { startBot, stopBot, isStarting, isStopping } = useBotControls();
  const { data: stats, isLoading: statsLoading } = useDashboardStats();
  const { data: recent, isLoading: recentLoading } = useRecentAnalyses();

  const isRunning = botStatus?.running ?? false;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold text-foreground">Welcome Back</h1>
          <p className="text-muted-foreground mt-1 text-lg">Here's what your Instagram Analyzer bot is doing.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-white/5 p-2 rounded-2xl border border-white/5">
          {isRunning ? (
            <Button 
              variant="destructive" 
              onClick={() => stopBot()} 
              disabled={isStopping || botLoading}
              className="w-32"
            >
              <Square className="w-4 h-4 mr-2" fill="currentColor" />
              Stop Bot
            </Button>
          ) : (
            <Button 
              variant="gradient" 
              onClick={() => startBot()} 
              disabled={isStarting || botLoading}
              className="w-32"
            >
              <Play className="w-4 h-4 mr-2" fill="currentColor" />
              Start Bot
            </Button>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        <StatCard 
          title="Total Analyses" 
          value={stats?.totalAnalyses ?? (botStatus?.totalAnalyses || 0)} 
          icon={Hash} 
          loading={statsLoading && botLoading}
          gradient
        />
        <StatCard 
          title="Unique Users" 
          value={stats?.uniqueUsers ?? 0} 
          icon={Users} 
          loading={statsLoading}
        />
        <StatCard 
          title="Analyses Today" 
          value={stats?.todayAnalyses ?? 0} 
          icon={Target} 
          loading={statsLoading}
        />
        <StatCard 
          title="Bot Uptime" 
          value={formatDuration(botStatus?.uptime ?? 0)} 
          icon={Activity} 
          loading={botLoading}
          valueClassName="text-2xl"
        />
      </motion.div>

      {/* Main Content Area */}
      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Recent Analyses Table */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Recent Analyses</CardTitle>
            </CardHeader>
            <CardContent>
              {recentLoading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 rounded-xl bg-white/5 animate-pulse" />
                  ))}
                </div>
              ) : recent?.length ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground uppercase bg-white/5 border-b border-white/10">
                      <tr>
                        <th className="px-4 py-3 rounded-tl-lg">Profile</th>
                        <th className="px-4 py-3">Followers</th>
                        <th className="px-4 py-3">Engagement</th>
                        <th className="px-4 py-3">Time</th>
                        <th className="px-4 py-3 rounded-tr-lg">Requester</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {recent.map((record) => (
                        <tr key={record.id} className="hover:bg-white/5 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {record.profilePicUrl ? (
                                <img src={record.profilePicUrl} className="w-8 h-8 rounded-full object-cover" alt="" />
                              ) : (
                                <div className="w-8 h-8 rounded-full bg-ig-purple/20 text-ig-pink flex items-center justify-center font-bold text-xs uppercase">
                                  {record.username.charAt(0)}
                                </div>
                              )}
                              <div>
                                <div className="font-semibold text-foreground flex items-center gap-1">
                                  @{record.username}
                                  {record.isVerified && <CheckCircle className="w-3 h-3 text-blue-500" />}
                                </div>
                                <div className="text-xs text-muted-foreground flex gap-1">
                                  {record.isBusinessAccount && <span>Business</span>}
                                  {record.isPrivate && <span>Private</span>}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 font-medium">{formatNumber(record.followers)}</td>
                          <td className="px-4 py-3">
                            <Badge variant={record.engagementRate > 3 ? "success" : "secondary"}>
                              {record.engagementRate.toFixed(2)}%
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                            {format(new Date(record.analyzedAt), "MMM d, HH:mm")}
                          </td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {record.requestedBy || "Unknown"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-lg font-medium">No analyses yet</p>
                  <p className="text-muted-foreground text-sm">Profiles analyzed by the bot will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* System Status / Top Profiles */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-muted-foreground">Polling Engine</span>
                  {isRunning ? (
                    <Badge variant="success" className="animate-in fade-in"><CheckCircle className="w-3 h-3 mr-1"/> Active</Badge>
                  ) : (
                    <Badge variant="destructive" className="animate-in fade-in"><AlertCircle className="w-3 h-3 mr-1"/> Stopped</Badge>
                  )}
                </div>
                <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-muted-foreground">Bot Name</span>
                  <span className="font-medium">{botStatus?.botName || "Unknown"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Most Analyzed</CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? (
                <div className="h-32 bg-white/5 rounded-xl animate-pulse" />
              ) : stats?.topProfiles?.length ? (
                <div className="space-y-3">
                  {stats.topProfiles.map((tp, idx) => (
                    <div key={tp.username} className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors group">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center text-xs font-bold text-muted-foreground group-hover:text-foreground group-hover:bg-primary/20 transition-colors">
                          {idx + 1}
                        </div>
                        <span className="font-medium text-foreground">@{tp.username}</span>
                      </div>
                      <Badge variant="secondary">{tp.count} times</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-4 text-muted-foreground text-sm">Not enough data yet</p>
              )}
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, loading, gradient, valueClassName }: { title: string, value: string | number, icon: any, loading?: boolean, gradient?: boolean, valueClassName?: string }) {
  return (
    <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
      <Card className="relative overflow-hidden group">
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-muted-foreground font-medium text-sm">{title}</h3>
            <div className={cn("p-2 rounded-xl transition-colors", gradient ? "bg-primary/20" : "bg-white/5 group-hover:bg-white/10")}>
              <Icon className={cn("w-5 h-5", gradient ? "text-ig-pink" : "text-foreground")} />
            </div>
          </div>
          {loading ? (
            <div className="h-10 w-24 bg-white/10 rounded-lg animate-pulse" />
          ) : (
            <div className={cn("text-4xl font-display font-bold", gradient && "text-gradient-ig", valueClassName)}>
              {typeof value === 'number' ? formatNumber(value) : value}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
