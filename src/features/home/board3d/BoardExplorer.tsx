import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import { lessonPart } from "@/content/icons";
import type { LessonEntry } from "@/domain/lesson";
import { PartIcon } from "@/ui/parts/PartIcon";
import { StageBox } from "@/ui/stage3d/StageBox";
import { useStage3d } from "@/ui/stage3d/use-stage";
import styles from "./BoardExplorer.module.css";
import { type BoardScene, buildBoardScene, PART_ANCHORS } from "./esp32-scene";
import { BOARD_PARTS, type PartId, partLessons } from "./parts";

const SHOWN = 4;

/**
 * Meet the board: the DevKitC in 3D with a callout per part, each tied to the model by a leader
 * line and listing the labs that use that part. Hover or pick a callout to light its part.
 */
export function BoardExplorer({ lessons }: { lessons: readonly LessonEntry[] }) {
  const cards = useRef(new Map<PartId, HTMLElement>());
  const scene = useRef<BoardScene | null>(null);
  const [picked, setPicked] = useState<PartId | null>(null);
  const [hover, setHover] = useState<PartId | null>(null);
  const { t } = useTranslation("home");
  const { boxRef, canvasRef, labelsRef, stageRef, status } = useStage3d(
    {
      target: { x: 0.1, y: -0.15, z: 0 },
      radius: 10,
      fitWidth: 8.4,
      az: 1.22,
      el: 0.74,
      fov: 30,
      spin: false,
      sway: 0.16,
      zoom: [0.55, 1.4],
      dragOn: "canvas",
      ground: { w: 9.5, d: 4.6, y: -0.82 },
    },
    (T, stage) => {
      scene.current = buildBoardScene(T, stage);
      BOARD_PARTS.forEach((part, i) => {
        const at = new T.Vector3(...PART_ANCHORS[part.id]);
        const card = cards.current.get(part.id);
        if (card) stage.leader(part.id, at, card);
        stage.label(String(i + 1), at, () => true, "stage-hotspot");
      });
    },
  );

  // Hover previews a part; a pick holds it (touch screens have no hover).
  const lit = hover ?? picked;
  useEffect(() => {
    if (status !== "ready") return;
    stageRef.current?.focus(lit);
    scene.current?.highlight(lit);
  }, [lit, status, stageRef]);

  return (
    <StageBox
      boxRef={boxRef}
      canvasRef={canvasRef}
      labelsRef={labelsRef}
      stageRef={stageRef}
      status={status}
      className={styles.explorer}
      viewClassName={styles.view}
      label={t("board.model")}
      fallback={t("board.fallback")}
    >
      <ol className={styles.cards}>
        {BOARD_PARTS.map((part, i) => {
          const uses = partLessons(part.id, lessons);
          const row = BOARD_PARTS.filter((p) => p.side === part.side).indexOf(part) + 1;
          return (
            <li
              key={part.id}
              ref={(el) => {
                if (el) cards.current.set(part.id, el);
                else cards.current.delete(part.id);
              }}
              className={styles.card}
              data-side={part.side}
              data-on={lit === part.id || undefined}
              style={{ gridRow: row }}
              onPointerEnter={() => setHover(part.id)}
              onPointerLeave={() => setHover(null)}
            >
              <button
                type="button"
                className={styles.head}
                aria-pressed={picked === part.id}
                onClick={() => setPicked((p) => (p === part.id ? null : part.id))}
                onFocus={() => setHover(part.id)}
                onBlur={() => setHover(null)}
              >
                <span className={styles.icon}>
                  <PartIcon name={part.part} size={44} />
                </span>
                <span className={styles.title}>
                  <span className={styles.num} aria-hidden="true">
                    {i + 1}
                  </span>
                  {t(`board.parts.${part.id}.title`)}
                </span>
              </button>
              <p className={styles.text}>{t(`board.parts.${part.id}.text`)}</p>
              {uses.length ? (
                <p className={styles.uses}>
                  <span className="visually-hidden">{t("board.usedIn")}</span>
                  {uses.slice(0, SHOWN).map((l) => (
                    <Link key={l.id} to={`/lessons/${l.id}`} title={l.title}>
                      <PartIcon name={lessonPart(l.id, l.track)} size={20} />
                      {l.id}
                    </Link>
                  ))}
                  {uses.length > SHOWN ? (
                    <span className={styles.more}>
                      {t("board.more", { count: uses.length - SHOWN })}
                    </span>
                  ) : null}
                </p>
              ) : null}
            </li>
          );
        })}
      </ol>
      <Link to="/chip" className={styles.inside}>
        {t("board.goInside")}
      </Link>
    </StageBox>
  );
}
