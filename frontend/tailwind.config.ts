import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        ink: "#12263a",
        accent: "#1d8f6e",
        coral: "#f07d62"
      },
      boxShadow: {
        card: "0 20px 45px rgba(18, 38, 58, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
