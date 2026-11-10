import { QueryClientProvider } from "@tanstack/react-query";
import { lazy, Suspense } from "react";
import { I18nextProvider } from "react-i18next";
import { RouterProvider } from "react-router/dom";
import { env } from "@/config/env";
import { i18n } from "@/i18n/i18n";
import { queryClient } from "./query-client";
import { router } from "./router";

// Devtools only in development, and in their own chunk.
const QueryDevtools = env.isDev
  ? lazy(() =>
      import("@tanstack/react-query-devtools").then((m) => ({ default: m.ReactQueryDevtools })),
    )
  : () => null;

export function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <Suspense>
          <QueryDevtools buttonPosition="bottom-left" />
        </Suspense>
      </QueryClientProvider>
    </I18nextProvider>
  );
}
