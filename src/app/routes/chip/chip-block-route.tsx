import type { QueryClient } from "@tanstack/react-query";
import { data, type LoaderFunctionArgs } from "react-router";
import { chipContentQuery } from "@/content/queries";
import { BlockPage } from "@/features/chip/pages/BlockPage";
import { currentLocale } from "@/i18n/i18n";
import type { RouteErrorReason } from "../../route-errors";

// Lazy route module: one block of the chip. The loader checks the id, so an unknown block is the
// route's 404 before anything renders.
export const blockLoader =
  (queryClient: QueryClient) =>
  async ({ params }: LoaderFunctionArgs) => {
    const blockId = params.blockId ?? "";
    const chip = await queryClient.query(chipContentQuery(currentLocale()));
    if (!chip.blocks.some((b) => b.id === blockId))
      throw data({ reason: "noBlock", id: blockId } satisfies RouteErrorReason, { status: 404 });
    return { blockId };
  };

export function Component() {
  return <BlockPage />;
}
