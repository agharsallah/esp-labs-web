import type { Block } from "../schema";
import { FigureView } from "./FigureView";
import { InlineView } from "./InlineView";
import { Paragraph } from "./Paragraph";
import { RegisterView } from "./RegisterView";
import { TableView } from "./TableView";
import styles from "./reader.module.css";

/** One block of a section. The drawer's title is the h2, so the section's own headings start at h3. */
export function BlockView({ block }: { block: Block }) {
  switch (block.t) {
    case "h": {
      const Tag = block.level <= 4 ? "h3" : "h4";
      return (
        <Tag className={styles.subhead}>
          <InlineView nodes={block.c} />
        </Tag>
      );
    }
    case "p":
      return <Paragraph sentences={block.s} />;
    case "list": {
      const items = block.items.map((item, i) => (
        <li key={i}>
          <Blocks blocks={item} />
        </li>
      ));
      return block.ordered ? (
        <ol className={styles.list} start={block.start}>
          {items}
        </ol>
      ) : (
        <ul className={styles.list}>{items}</ul>
      );
    }
    case "quote":
      return (
        <div className={styles.note}>
          <Blocks blocks={block.c} />
        </div>
      );
    case "pre":
      return (
        <pre className={styles.pre}>
          <code>{block.v}</code>
        </pre>
      );
    case "fig":
      return <FigureView src={block.src} alt={block.alt} caption={block.caption} />;
    case "table":
      return <TableView table={block} />;
    case "register":
      return <RegisterView register={block} />;
  }
}

export function Blocks({ blocks }: { blocks: readonly Block[] }) {
  return blocks.map((b, i) => <BlockView key={i} block={b} />);
}
