import { useTranslation } from "react-i18next";
import { createHashRouter, data } from "react-router";
import { syncLocaleWithUrl } from "./locale-url";
import { AppLayout } from "./AppLayout";
import { queryClient } from "./query-client";
import { RouteError } from "./RouteError";
import type { RouteErrorReason } from "./route-errors";
import { HomeRoute, homeLoader } from "./routes/home-route";
import { LessonRoute, lessonLoader, trackLoader } from "./routes/lesson-route";

// A hash router: the guide is a static bundle that must work on any static host (any subfolder) and a
// claude.ai artifact, none of which can rewrite deep paths to index.html. URLs look like
// #/lessons/R3?variant=v2 and are shareable.
function LoadingGuide() {
  const { t } = useTranslation();
  return <p className="visually-hidden">{t("app.loading")}</p>;
}

export const router = createHashRouter([
  {
    path: "/",
    Component: AppLayout,
    ErrorBoundary: RouteError,
    // First paint while the first lesson's content chunk loads (a few ms from cache).
    HydrateFallback: LoadingGuide,
    children: [
      {
        ErrorBoundary: RouteError,
        children: [
          { index: true, loader: homeLoader(queryClient), Component: HomeRoute },
          { path: "lessons", loader: homeLoader(queryClient), Component: HomeRoute },
          { path: "tracks/:trackId", loader: trackLoader(queryClient) },
          { path: "lessons/:lessonId", loader: lessonLoader(queryClient), Component: LessonRoute },
          {
            // Reading a lab's code: same loader, its own lazily loaded screen.
            path: "lessons/:lessonId/code",
            loader: lessonLoader(queryClient),
            lazy: async () => ({ Component: (await import("./routes/code-route")).Component }),
          },
          {
            // The chip pages: one lazily loaded module per page, sharing the chip section nav.
            path: "chip",
            lazy: async () => ({ Component: (await import("./routes/chip/chip-layout-route")).Component }),
            children: [
              { index: true, lazy: async () => ({ Component: (await import("./routes/chip/chip-home-route")).Component }) },
              { path: "pins", lazy: async () => ({ Component: (await import("./routes/chip/chip-pins-route")).Component }) },
              { path: "blocks", lazy: async () => ({ Component: (await import("./routes/chip/chip-atlas-route")).Component }) },
              {
                path: "blocks/:blockId",
                lazy: async () => {
                  const route = await import("./routes/chip/chip-block-route");
                  return { loader: route.blockLoader(queryClient), Component: route.Component };
                },
              },
              { path: "inside", lazy: async () => ({ Component: (await import("./routes/chip/chip-inside-route")).Component }) },
            ],
          },
          {
            path: "settings",
            lazy: async () => ({ Component: (await import("./routes/settings-route")).Component }),
          },
          {
            path: "parts",
            lazy: async () => ({ Component: (await import("./routes/parts-route")).Component }),
          },
          {
            path: "log",
            lazy: async () => {
              const route = await import("./routes/log-route");
              return { loader: route.logLoader(queryClient), Component: route.Component };
            },
          },
          {
            path: "*",
            loader: () => {
              throw data({ reason: "noPage" } satisfies RouteErrorReason, { status: 404 });
            },
            Component: () => null,
          },
        ],
      },
    ],
  },
]);

// Every URL carries the language on screen (?lang=), so a copied link opens in it.
syncLocaleWithUrl(router);
