import type { RefDoc } from "./schema";

// Espressif's official documents, one per part of the reference. The chip datasheet and the TRM
// are the URLs its §X4.5 "Related Documentation" lists; the module datasheet uses the same
// address scheme with the file name §X4.2 gives; the board has an HTML user guide. The
// appendices come from the TRM.
export const OFFICIAL_DOCS: Readonly<Record<RefDoc, string>> = {
  A: "https://docs.espressif.com/projects/esp-dev-kits/en/latest/esp32s3/esp32-s3-devkitc-1/user_guide.html",
  M: "https://espressif.com/documentation/esp32-s3-wroom-1_wroom-1u_datasheet_en.pdf",
  C: "https://espressif.com/documentation/esp32-s3_datasheet_en.pdf",
  T: "https://espressif.com/documentation/esp32-s3_technical_reference_manual_en.pdf",
  X: "https://espressif.com/documentation/esp32-s3_technical_reference_manual_en.pdf",
};
