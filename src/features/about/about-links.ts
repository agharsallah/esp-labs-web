/** Where the guide's author can be found. Labels live in the `common` catalogue (`about.links.<id>`). */
export const AUTHOR_LINKS = [
  { id: "linkedin", href: "https://www.linkedin.com/in/gharsallah/" },
  { id: "github", href: "https://github.com/agharsallah" },
  { id: "x", href: "https://x.com/abderrahmen_g" },
] as const;

/** The one call to action, drawn apart from the plain links. */
export const COFFEE_URL = "https://buymeacoffee.com/agharsallah";

/** Where readers report a mistake or propose a lab. */
export const ISSUES_URL = "https://github.com/agharsallah/esp-labs-web/issues/new/choose";

/** A click on a modal dialog's backdrop targets the dialog itself, outside its box. */
export function isOutside(
  box: Pick<DOMRectReadOnly, "left" | "right" | "top" | "bottom">,
   x: number, y: number): boolean {
  return x < box.left || x > box.right || y < box.top || y > box.bottom;
}

/** Everyone who has contributed to the guide, on GitHub. */
export const CONTRIBUTORS_URL = "https://github.com/agharsallah/esp-labs-web/graphs/contributors";
