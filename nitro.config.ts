//https://nitro.unjs.io/config
export default defineNitroConfig({
  srcDir: "server",
  compatibilityDate: "2024-12-29",
  runtimeConfig: {
    discordPublicKey: process.env.DISCORD_PUBLIC_KEY,
  },
});
