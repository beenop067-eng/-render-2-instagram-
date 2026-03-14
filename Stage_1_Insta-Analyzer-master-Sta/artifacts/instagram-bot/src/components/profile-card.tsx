import { motion } from "framer-motion";
import { ExternalLink, CheckCircle, Lock, Briefcase, Heart, MessageCircle, TrendingUp, Users, Grid } from "lucide-react";
import { format } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";
import type { AnalysisResult } from "@workspace/api-client-react";

export function ProfileCard({ profile }: { profile: AnalysisResult }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className="overflow-hidden border-ig-purple/20 shadow-2xl shadow-ig-purple/10">
        <div className="h-32 bg-gradient-ig opacity-20" />
        <CardContent className="relative px-6 pb-8 pt-0 sm:px-8">
          <div className="flex flex-col sm:flex-row gap-6 sm:items-end -mt-16 mb-6">
            <div className="relative">
              {profile.profilePicUrl ? (
                <img 
                  src={profile.profilePicUrl} 
                  alt={profile.username} 
                  className="w-32 h-32 rounded-full border-4 border-card object-cover bg-muted"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${profile.username}&background=random`;
                  }}
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-card bg-muted flex items-center justify-center text-4xl font-bold uppercase text-muted-foreground">
                  {profile.username.charAt(0)}
                </div>
              )}
              {profile.isVerified && (
                <div className="absolute bottom-2 right-2 bg-background rounded-full p-0.5">
                  <CheckCircle className="w-6 h-6 text-blue-500 fill-blue-500/20" />
                </div>
              )}
            </div>
            
            <div className="flex-1 pb-2">
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-3xl font-display font-bold text-foreground">@{profile.username}</h2>
                <div className="flex gap-2">
                  {profile.isPrivate && <Badge variant="secondary"><Lock className="w-3 h-3 mr-1"/> Private</Badge>}
                  {profile.isBusinessAccount && <Badge variant="secondary"><Briefcase className="w-3 h-3 mr-1"/> Business</Badge>}
                </div>
              </div>
              <h3 className="text-lg font-medium text-muted-foreground">{profile.fullName || "No Name Provided"}</h3>
            </div>

            {profile.externalUrl && (
              <a 
                href={profile.externalUrl} 
                target="_blank" 
                rel="noreferrer"
                className="pb-3 flex items-center gap-2 text-primary hover:text-ig-pink transition-colors text-sm font-semibold"
              >
                View Profile <ExternalLink className="w-4 h-4" />
              </a>
            )}
          </div>

          {profile.bio && (
            <div className="mb-8 max-w-2xl text-foreground/90 whitespace-pre-wrap">
              {profile.bio}
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <StatBox icon={Users} label="Followers" value={formatNumber(profile.followers)} />
            <StatBox icon={Users} label="Following" value={formatNumber(profile.following)} />
            <StatBox icon={Grid} label="Posts" value={formatNumber(profile.postsCount)} />
            <StatBox 
              icon={TrendingUp} 
              label="Engagement" 
              value={`${profile.engagementRate.toFixed(2)}%`} 
              highlight 
            />
          </div>

          {(profile.avgLikes !== undefined || profile.avgComments !== undefined || profile.accountCategory) && (
            <div className="bg-white/5 rounded-2xl p-6 border border-white/5">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Post Averages & Details</h4>
              <div className="flex flex-wrap gap-8">
                {profile.avgLikes !== undefined && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center">
                      <Heart className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{formatNumber(profile.avgLikes)}</p>
                      <p className="text-xs text-muted-foreground">Avg Likes</p>
                    </div>
                  </div>
                )}
                {profile.avgComments !== undefined && (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{formatNumber(profile.avgComments)}</p>
                      <p className="text-xs text-muted-foreground">Avg Comments</p>
                    </div>
                  </div>
                )}
                {profile.accountCategory && (
                  <div className="flex items-center gap-3 ml-auto">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Category</p>
                      <Badge variant="outline" className="mt-1 border-white/20 text-sm px-3 py-1">
                        {profile.accountCategory}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          
          <div className="mt-6 text-xs text-muted-foreground text-center sm:text-left">
            Analysis completed at {format(new Date(profile.analyzedAt), "PPpp")}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function StatBox({ icon: Icon, label, value, highlight = false }: { icon: any, label: string, value: string | number, highlight?: boolean }) {
  return (
    <div className={cn(
      "p-5 rounded-2xl border transition-colors",
      highlight ? "bg-gradient-ig text-white border-transparent" : "bg-white/5 border-white/5 hover:bg-white/10"
    )}>
      <div className="flex items-center gap-2 mb-2 opacity-80">
        <Icon className="w-4 h-4" />
        <span className="text-sm font-medium">{label}</span>
      </div>
      <p className={cn("text-3xl font-display font-bold", highlight ? "text-white" : "text-foreground")}>
        {value}
      </p>
    </div>
  );
}
