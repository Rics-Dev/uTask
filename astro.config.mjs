// @ts-check
import { defineConfig } from "astro/config";

import tailwind from "@astrojs/tailwind";

import vercel from "@astrojs/vercel";

import db from "@astrojs/db";



import solidJs from "@astrojs/solid-js";



import icon from "astro-icon";



// https://astro.build/config
export default defineConfig({
  output: "server",
  integrations: [tailwind(), db(), solidJs(), icon()],
  adapter: vercel(),
});
