/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        // A highly legible, neutral sans-serif for UI and body text.
        // The gold standard for modern web apps.
        sans: ["Inter", "system-ui", "sans-serif"],

        // An elegant, readable serif for headings and articles.
        // Pairs beautifully with Inter.
        serif: ["Lora", "Georgia", "serif"],

        // A clean monospace for data, code snippets, or timestamps.
        mono: ["JetBrains Mono", "ui-monospace", "monospace"],
      },
      colors: {
        background: "rgb(var(--color-background))",
        semibackground: "rgb(var(--color-semi-background))",
        tablebackground: "rgb(var(--color-table-background))",
        foreground: "rgb(var(--color-foreground))",
        primary: "rgb(var(--color-primary))",
        secondary: "rgb(var(--color-secondary))",
        accent: "rgb(var(--color-accent))",
        selected: "rgb(var(--color-selected))",
        muted: "rgb(var(--color-muted))",
        success: "rgb(var(--color-success))",
        warning: "rgb(var(--color-warning))",
        error: "rgb(var(--color-error))",
        hover: "rgb(var(--color-hover))",
        secondarybutton: "rgb(var(--color-secondary-button))",
        secondaryhover: "rgb(var(--color-secondary-hover))",
        errorhover: "rgb(var(--color-error-hover))",
      },
      spacing: {
        18: "4.5rem",
        68: "17rem",
        100: "25rem",
        120: "30rem",
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            color: "rgb(var(--color-foreground))",
            a: {
              color: "rgb(var(--color-accent))",
              "&:hover": {
                color: "rgba(var(--color-accent), 0.8)",
              },
            },
            h1: {
              color: "rgb(var(--color-primary))",
              fontFamily: theme("fontFamily.sans").join(", "),
            },
            h2: {
              color: "rgb(var(--color-primary))",
              fontFamily: theme("fontFamily.sans").join(", "),
            },
            h3: {
              color: "rgb(var(--color-primary))",
              fontFamily: theme("fontFamily.sans").join(", "),
            },
            h4: {
              color: "rgb(var(--color-primary))",
              fontFamily: theme("fontFamily.sans").join(", "),
            },
            blockquote: {
              color: "rgb(var(--color-secondary))",
              borderLeftColor: "rgba(var(--color-secondary), 0.4)",
            },
            code: {
              color: "rgb(var(--color-primary))",
            },
            pre: {
              backgroundColor: "rgba(var(--color-primary), 0.05)",
            },
          },
        },
      }),
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    function ({ addComponents }) {
      addComponents({
        ".prose": {
          maxWidth: "65ch",
          color: "rgb(var(--color-foreground))",
          "> *": {
            marginTop: "1.25em",
            marginBottom: "1.25em",
          },
        },
      });
    },
  ],
};
