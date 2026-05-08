/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        dungeon: {
          bg:      "#0d0d0f",
          surface: "#16161a",
          border:  "#2a2a35",
          gold:    "#c9a84c",
          amber:   "#e8a020",
          correct: "#3a7d44",
          partial: "#b5860d",
          wrong:   "#2a2a35",
          text:    "#e8e0d0",
          muted:   "#7a7068",
        },
      },
      fontFamily: {
        display: ["'Cinzel'", "serif"],
        body:    ["'Crimson Pro'", "serif"],
        mono:    ["'Share Tech Mono'", "monospace"],
      },
    },
  },
  plugins: [],
};
