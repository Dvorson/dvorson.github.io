import { type Config } from "tailwindcss";
import typography from "@tailwindcss/typography";

export default {
  content: [
    "./routes/**/*.{tsx,ts}",
    "./islands/**/*.{tsx,ts}",
    // Add other paths if necessary, e.g., "./components/**/*.{tsx,ts}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "sans-serif"], // Match the font from style.css
      },
      colors: { // Optional: Define custom colors if needed, or rely on Tailwind defaults
        primary: "#4f46e5",
        "primary-hover": "#4338ca",
        secondary: "#9333ea",
        "secondary-hover": "#7e22ce",
      }
    },
  },
  plugins: [
    typography,
  ],
} satisfies Config;