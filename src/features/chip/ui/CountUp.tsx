import { useCountUp } from "../hooks/use-count-up";
import { useNumber } from "../hooks/use-format";

/** A number that counts up once `start` is true, formatted for the language on screen. */
export function CountUp({ value, start }: { value: number; start: boolean }) {
  const shown = useCountUp(value, start);
  const num = useNumber();
  return (
    <>
      <span aria-hidden="true">{num(shown)}</span>
      <span className="visually-hidden">{num(value)}</span>
    </>
  );
}
