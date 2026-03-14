import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetRecentAnalyses, 
  useGetBotStats, 
  useAnalyzeProfile,
  getGetRecentAnalysesQueryKey,
  getGetBotStatsQueryKey
} from "@workspace/api-client-react";

export function useRecentAnalyses(limit = 20) {
  return useGetRecentAnalyses(
    { limit },
    {
      query: {
        refetchInterval: 10000, // Poll table every 10s
      }
    }
  );
}

export function useDashboardStats() {
  return useGetBotStats({
    query: {
      refetchInterval: 10000,
    }
  });
}

export function useAnalyze() {
  const queryClient = useQueryClient();
  
  return useAnalyzeProfile({
    mutation: {
      onSuccess: () => {
        // Refresh tables and stats when a new analysis completes
        queryClient.invalidateQueries({ queryKey: getGetRecentAnalysesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetBotStatsQueryKey() });
      }
    }
  });
}
