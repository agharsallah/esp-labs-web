// Bundled at build time by tools/contributors/vite-plugin.ts: the repo's contributors on GitHub,
// without its owner and bots, most contributions first.
declare module "virtual:contributors" {
  const contributors: readonly { readonly login: string; readonly url: string }[];
  export default contributors;
}
