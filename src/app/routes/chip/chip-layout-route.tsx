import { ChipSection } from "@/features/chip/ChipSection";
import { ReferenceDrawer } from "@/features/reference/ReferenceDrawer";

// Lazy route module: the chip section, its page pills and the page under them, and the reference
// reader that any page's citation opens with `?ref=`.
export function Component() {
  return (
    <>
      <ChipSection />
      <ReferenceDrawer />
    </>
  );
}
