import { useQueryClient } from "@tanstack/react-query";
import { 
  useGetBotStatus, 
  useStartBot, 
  useStopBot,
  getGetBotStatusQueryKey
} from "@workspace/api-client-react";

export function useBotPolling() {
  return useGetBotStatus({
    query: {
      refetchInterval: 5000, // Poll every 5 seconds
    }
  });
}

export function useBotControls() {
  const queryClient = useQueryClient();

  const startMutation = useStartBot({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetBotStatusQueryKey() });
      }
    }
  });

  const stopMutation = useStopBot({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetBotStatusQueryKey() });
      }
    }
  });

  return {
    startBot: startMutation.mutate,
    isStarting: startMutation.isPending,
    stopBot: stopMutation.mutate,
    isStopping: stopMutation.isPending,
  };
}
