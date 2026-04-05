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
        card: "0 22px 70px rgba(18, 38, 58, 0.06), 0 8px 22px rgba(18, 38, 58, 0.03)"
      }
    }
  },
  plugins: []
};

export default config;
