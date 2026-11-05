import { MutationCache, QueryCache, QueryClient } from "@tanstack/react-query";
import { createLogger, errorData } from "@/lib/logger";

const log = createLogger("query");

// One client for the app. Failures are logged once here instead of in every component.
export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) =>
      log.error("query failed", { key: query.queryKey, ...errorData(error) }),
  }),
  mutationCache: new MutationCache({
    onError: (error) => log.error("mutation failed", errorData(error)),
  }),
  // offlineFirst: run each fetch once even when the browser says offline, so the service worker
  // can answer from its cache; only retries wait for the network ("online" would pause them all).
  defaultOptions: {
    queries: {
      networkMode: "offlineFirst",
      retry: 2,
      refetchOnWindowFocus: true,
    },
    mutations: { networkMode: "offlineFirst" },
  },
});
