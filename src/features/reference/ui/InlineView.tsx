import { useTranslation } from "react-i18next";
import { Link } from "react-router";
import type { Inline } from "../schema";
import { useReader } from "./reader-context";
import { SectionLinkTo } from "./SectionLinkTo";
import styles from "./reader.module.css";

/** The reference's inline text, with its tagged spans: numbers, names, pins, blocks, cross-references. */
export function InlineView({ nodes }: { nodes: readonly Inline[] }) {
  return nodes.map((node, i) => <InlineNode key={i} node={node} />);
}

// Hooks live in the few linking nodes only: a long section has thousands of text nodes.
function InlineNode({ node }: { node: Inline }) {
  switch (node.t) {
    case "text":
      return node.v;
    case "b":
      return (
        <b>
          <InlineView nodes={node.c} />
        </b>
      );
    case "i":
      return (
        <i>
          <InlineView nodes={node.c} />
        </i>
      );
    case "code":
      return <code className={styles.code}>{node.v}</code>;
    case "sub":
      return <sub>{node.v}</sub>;
    case "br":
      return <br />;
    case "link":
      return <ExternalLink href={node.href} nodes={node.c} />;
    case "xref":
      return <SectionXref id={node.id} nodes={node.c} />;
    case "num":
      return <span className={styles.num}>{node.v}</span>;
    case "reg":
    case "field":
      return (
        <code className={styles.name} data-kind={node.t}>
          {node.v}
        </code>
      );
    case "pin":
      return <PinChip n={node.n} text={node.v} />;
    case "block":
      return <BlockChip id={node.id} text={node.v} />;
  }
}

function ExternalLink({ href, nodes }: { href: string; nodes: readonly Inline[] }) {
  const { t } = useTranslation("chip");
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={styles.link}>
      <InlineView nodes={nodes} />
      <span className="visually-hidden"> {t("reader.newTab")}</span>
    </a>
  );
}

/** A cross-reference: opens the other section in the reader (Back returns here). */
function SectionXref({ id, nodes }: { id: string; nodes: readonly Inline[] }) {
  return (
    <SectionLinkTo id={id} className={styles.xref}>
      <InlineView nodes={nodes} />
    </SectionLinkTo>
  );
}

/** A GPIO: links to its card on the pins page (which closes the reader). */
export function PinChip({ n, text }: { n: number; text: string }) {
  const { pins } = useReader();
  return pins.has(n) ? (
    <Link to={`/datasheet/pins?pin=${n}`} viewTransition className={styles.pin}>
      {text}
    </Link>
  ) : (
    <code className={styles.name}>{text}</code>
  );
}

function BlockChip({ id, text }: { id: string; text: string }) {
  const { blocks } = useReader();
  return blocks.has(id) ? (
    <Link to={`/datasheet/blocks/${id}`} viewTransition className={styles.block}>
      {text}
    </Link>
  ) : (
    text
  );
}
