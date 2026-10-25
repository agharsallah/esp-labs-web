import { type CSSProperties, type ReactNode, useId, useState } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router";
import { lessonPart } from "@/content/icons";
import { KIT_ITEMS, type KitItemId, lessonKit } from "@/content/kit";
import type { ActiveLesson } from "@/domain/lesson";
import { type KitMatch, kitParts, matchKit } from "@/domain/kit";
import type { Track } from "@/domain/track";
import type { TrackContent } from "@/features/navigation/use-tracks";
import { useLocaleInfo } from "@/i18n/use-locale";
import { useStore } from "@/lib/storage";
import { Icon } from "@/ui/Icon";
import { PartIcon } from "@/ui/parts/PartIcon";
import { kitStore, toggleKitItem } from "./kit-store";
import styles from "./KitFinder.module.css";
import { matchesQuery } from "./search";

interface Found {
  readonly lesson: ActiveLesson;
  readonly track: Track;
  readonly match: KitMatch<KitItemId>;
}

/** How many "one part away" labs show before the list is opened. */
const NEAR_SHOWN = 6;

const PART_OF = new Map(KIT_ITEMS.map((i) => [i.id, i.part]));

/**
 * "What's on your bench?": tick the parts you have (or search for them) and see the labs you
 * can build now, and the ones a single part away.
 */
export function KitFinder({ tracks }: { tracks: readonly TrackContent[] }) {
  const { t } = useTranslation("home");
  const { tag } = useLocaleInfo();
  const searchId = useId();
  const [query, setQuery] = useState("");
  const [allNear, setAllNear] = useState(false);
  const have = new Set(useStore(kitStore));

  const found: Found[] = tracks.flatMap(({ track, lessons }) =>
    (lessons ?? [])
      .filter((l): l is ActiveLesson => l.kind === "lesson")
      .map((lesson) => ({ lesson, track, match: matchKit(lessonKit(lesson.id), have) })),
  );
  const ready = found.filter((f) => f.match.fit === "ready");
  const near = found.filter((f) => f.match.fit === "near");
  const far = found.length - ready.length - near.length;

  const name = (id: KitItemId) => t(`kit.items.${id}`);
  const either = new Intl.ListFormat(tag, { type: "disjunction" });
  const usedIn = (id: KitItemId) => found.filter((f) => kitParts(lessonKit(f.lesson.id)).has(id));
  const shown = KIT_ITEMS.filter((i) => matchesQuery(query, [name(i.id), i.id]));

  return (
    <section className={styles.kit} aria-labelledby="kit-title">
      <div className={styles.head}>
        <h2 id="kit-title">{t("kit.title")}</h2>
        <p>{t("kit.intro")}</p>
      </div>

      <div className={styles.layout}>
        <div className={styles.picker}>
          <p className={styles.basics}>
            <PartIcon name="devkit" size={32} />
            <PartIcon name="cable" size={32} />
            <span>{t("kit.basics")}</span>
          </p>

          <div className={styles.toolbar}>
            <label className={styles.search} htmlFor={searchId}>
              <Icon name="search" size={18} />
              <span className="visually-hidden">{t("kit.search.label")}</span>
              <input
                id={searchId}
                type="search"
                value={query}
                placeholder={t("kit.search.placeholder")}
                onChange={(e) => setQuery(e.target.value)}
              />
            </label>
            <div className={styles.actions}>
              <button
                type="button"
                className={styles.action}
                disabled={have.size === KIT_ITEMS.length}
                onClick={() => kitStore.set(KIT_ITEMS.map((i) => i.id))}
              >
                {t("kit.all")}
              </button>
              <button
                type="button"
                className={styles.action}
                disabled={have.size === 0}
                onClick={() => kitStore.set([])}
              >
                {t("kit.clear")}
              </button>
            </div>
          </div>

          {shown.length ? (
            <ul className={styles.chips} aria-label={t("kit.parts")}>
              {shown.map((item) => {
                const on = have.has(item.id);
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      className={styles.chip}
                      aria-pressed={on}
                      onClick={() => toggleKitItem(item.id)}
                    >
                      <span className={styles.chipIcon}>
                        <PartIcon name={item.part} size={40} />
                        <span className={styles.tick} aria-hidden="true">
                          {on ? <Icon name="check" size={12} /> : null}
                        </span>
                      </span>
                      <span className={styles.chipText}>
                        <span className={styles.chipName}>{name(item.id)}</span>
                        <span className={styles.chipCount}>
                          {t("kit.usedIn", { count: usedIn(item.id).length })}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className={styles.none}>{t("kit.search.none", { query })}</p>
          )}
        </div>

        <div className={styles.results} aria-live="polite">
          <p className={styles.readout}>
            <Trans
              t={t}
              i18nKey="kit.readout"
              values={{ ready: ready.length, total: found.length }}
              components={{ b: <b />, small: <small />, span: <span /> }}
            />
          </p>

          <h3 className={styles.groupHead}>
            <Icon name="check" size={16} />
            {t("kit.ready", { count: ready.length })}
          </h3>
          <ol className={styles.tiles}>
            {ready.map((f) => (
              <Tile key={f.lesson.id} found={f} />
            ))}
          </ol>

          {near.length ? (
            <>
              <h3 className={styles.groupHead}>
                <Icon name="wire" size={16} />
                {t("kit.near", { count: near.length })}
              </h3>
              <ol className={styles.tiles}>
                {(allNear ? near : near.slice(0, NEAR_SHOWN)).map((f) => {
                  const need = f.match.missing[0] ?? [];
                  const add = t("kit.add", { part: either.format(need.map(name)) });
                  return (
                    <Tile key={f.lesson.id} found={f}>
                      <span className={styles.missing} title={add}>
                        <span className={styles.plus} aria-hidden="true">
                          +
                        </span>
                        {need.map((id) => {
                          const part = PART_OF.get(id);
                          return part ? <PartIcon key={id} name={part} size={24} /> : null;
                        })}
                        <span className="visually-hidden">{add}</span>
                      </span>
                    </Tile>
                  );
                })}
              </ol>
              {near.length > NEAR_SHOWN ? (
                <button
                  type="button"
                  className={styles.action}
                  aria-expanded={allNear}
                  onClick={() => setAllNear(!allNear)}
                >
                  {allNear
                    ? t("kit.fewer")
                    : t("board.more", { count: near.length - NEAR_SHOWN })}
                </button>
              ) : null}
            </>
          ) : null}

          {far ? <p className={styles.far}>{t("kit.far", { count: far })}</p> : null}
        </div>
      </div>
    </section>
  );
}

function Tile({ found, children }: { found: Found; children?: ReactNode }) {
  const { lesson, track } = found;
  const style = { "--track": `var(${track.color})` } as CSSProperties;
  return (
    <li style={style} data-fit={found.match.fit}>
      <Link to={`/lessons/${lesson.id}`} className={styles.tile}>
        <span className={styles.pad}>
          <PartIcon name={lessonPart(lesson.id, lesson.track)} size={36} />
        </span>
        <span className={styles.tileText}>
          <span className={styles.tileId}>{lesson.id}</span>
          <span className={styles.tileName}>{lesson.title}</span>
          {children}
        </span>
      </Link>
    </li>
  );
}
