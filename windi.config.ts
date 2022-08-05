import { defineConfig } from "windicss/helpers";

export default defineConfig({
  plugins: [require("@windicss/plugin-scrollbar")],
  variants: {
    scrollbar: ["rounded"],
  },
});
