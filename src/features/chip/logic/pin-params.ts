import { PIN_FUNCTION_KINDS, type PinFunctionKind } from "@/domain/chip";

// The pins page keeps the picked pin and the function filter in the URL (?pin=3&fn=adc).

const isKind = (v: string | null): v is PinFunctionKind =>
  v !== null && (PIN_FUNCTION_KINDS as readonly string[]).includes(v);

export function parsePinParams(
  params: URLSearchParams,
  gpios: readonly number[],
): { pin: number | null; kind: PinFunctionKind | "all" } {
  const raw = params.get("pin");
  const n = raw !== null && /^\d+$/.test(raw) ? Number(raw) : null;
  const fn = params.get("fn");
  return { pin: n !== null && gpios.includes(n) ? n : null, kind: isKind(fn) ? fn : "all" };
}

export function withPinParams(
  params: URLSearchParams,
  change: { pin?: number | null; kind?: PinFunctionKind | "all" },
): URLSearchParams {
  const next = new URLSearchParams(params);
  if (change.pin !== undefined) {
    if (change.pin === null) next.delete("pin");
    else next.set("pin", String(change.pin));
  }
  if (change.kind !== undefined) {
    if (change.kind === "all") next.delete("fn");
    else next.set("fn", change.kind);
  }
  return next;
}
