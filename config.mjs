// Copiado y simplificado de packages/web/config.mjs (OpenVoryel).
// SST_STAGE=production -> dominio prod, resto -> preview por stage.
const stage = process.env.SST_STAGE || "dev"

export default {
  url: process.env.SITE_URL || (stage === "production" ? "https://openvoryel.pages.dev" : `https://${stage}.openvoryel.pages.dev`),
  console: "https://opencode.ai/auth",
  zen: "https://opencode.ai/zen",
  zenApi: "https://opencode.ai/zen/v1",
  email: "help@anoma.ly",
  github: "https://github.com/iDontrixss/OpenVoryel",
  headerLinks: [
    { name: "Home", url: "/" },
    { name: "App", url: "/app" },
  ],
}
