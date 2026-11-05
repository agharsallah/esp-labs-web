import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useRegisterSW } from "virtual:pwa-register/react";
import { createLogger, errorData } from "@/lib/logger";
import { useOnline } from "@/lib/online";
import { type OfflineNotice as Notice, pickNotice } from "./notice";
import styles from "./OfflineNotice.module.css";

const log = createLogger("offline");

// A long lesson session still hears about a new deploy: ask the server once an hour.
const UPDATE_CHECK_MS = 60 * 60 * 1000;

function watchForUpdates(_url: string, registration: ServiceWorkerRegistration | undefined) {
  if (!registration) return;
  setInterval(() => {
    if (navigator.onLine) void registration.update();
  }, UPDATE_CHECK_MS);
}

/**
 * Registers the service worker that keeps the guide working offline, and tells the reader when
 * it is saved on the device, when they are offline, and when a new version waits for a reload.
 */
export function OfflineNotice() {
  const { t } = useTranslation();
  const online = useOnline();
  const [dismissed, setDismissed] = useState<ReadonlySet<Notice>>(() => new Set());
  const {
    needRefresh: [needRefresh],
    offlineReady: [offlineReady],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW: watchForUpdates,
    // A sandboxed frame or a private window may refuse service workers: the guide still works online.
    onRegisterError: (error: unknown) =>
      log.warn("service worker not registered", errorData(error)),
  });

  const notice = pickNotice({ needRefresh, offlineReady, online, dismissed });
  if (!notice) return null;

  const dismiss = () => setDismissed((d) => new Set(d).add(notice));

  return (
    <div className={styles.notice} role="status" data-kind={notice}>
      <p className={styles.text}>{t(`offline.${notice}`)}</p>
      <div className={styles.actions}>
        {notice === "update" ? (
          <button
            type="button"
            className={styles.primary}
            onClick={() => void updateServiceWorker()}
          >
            {t("offline.reload")}
          </button>
        ) : null}
        <button type="button" className={styles.secondary} onClick={dismiss}>
          {t(notice === "update" ? "offline.later" : "offline.dismiss")}
        </button>
      </div>
    </div>
  );
}
