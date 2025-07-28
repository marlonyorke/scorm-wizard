import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "var(--border-color)",
        input: "var(--input-color)",
        ring: "var(--ring-color)",
        background: "var(--primary-bg)",
        foreground: "var(--primary-text)",
        primary: {
          DEFAULT: "var(--primary-accent)",
          foreground: "var(--primary-text)",
        },
        secondary: {
          DEFAULT: "var(--secondary-accent)",
          foreground: "var(--primary-text)",
        },
        destructive: {
          DEFAULT: "var(--error)",
          foreground: "var(--primary-text)",
        },
        muted: {
          DEFAULT: "var(--secondary-bg)",
          foreground: "var(--secondary-text)",
        },
        accent: {
          DEFAULT: "var(--primary-accent)",
          foreground: "var(--primary-text)",
        },
        popover: {
          DEFAULT: "var(--secondary-bg)",
          foreground: "var(--primary-text)",
        },
        card: {
          DEFAULT: "var(--secondary-bg)",
          foreground: "var(--primary-text)",
        },
        // Thema-specifieke kleuren
        cosmic: {
          bg: "#0A0E17",
          secondary: "#1A2036",
          accent: "#8A4FFF",
          text: "#F0F2F8",
        },
        cyberpunk: {
          bg: "#080808",
          secondary: "#121212",
          accent: "#B026FF",
          text: "#FFFFFF",
        },
        aurora: {
          bg: "#121218",
          secondary: "#22263A",
          accent: "#7B68EE",
          text: "#E8EAEF",
        },
        neon: {
          primary: "var(--primary-accent)",
          secondary: "var(--secondary-accent)",
          glow: "var(--box-shadow)",
          dark: "#0c0032",
          deep: "#190061",
          highlight: "#00f2ff",
          purple: "#7b2ff7",
          pink: "#ff0055",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "aurora-flow": "aurora 15s ease infinite",
        "fadeIn": "fadeIn 0.3s ease-in-out",
        "scaleIn": "scaleIn 0.3s ease-in-out",
        "bounce": "bounce 1s ease-in-out infinite",
        "pulse": "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "neon-pulse": "neon-pulse 2s ease-in-out infinite",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        aurora: {
          "0%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
          "100%": { backgroundPosition: "0% 50%" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        scaleIn: {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        bounce: {
          "0%, 100%": { transform: "translateY(-5%)", animationTimingFunction: "cubic-bezier(0.8, 0, 1, 1)" },
          "50%": { transform: "translateY(0)", animationTimingFunction: "cubic-bezier(0, 0, 0.2, 1)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "neon-pulse": {
          "0%": { boxShadow: "0 0 10px rgba(0, 242, 255, 0.5)" },
          "50%": { boxShadow: "0 0 20px rgba(0, 242, 255, 0.8)" },
          "100%": { boxShadow: "0 0 10px rgba(0, 242, 255, 0.5)" },
        },
      },
      backgroundImage: {
        "cosmic-gradient": "linear-gradient(135deg, #0A0E17 0%, #131A2F 100%)",
        "cosmic-accent": "linear-gradient(135deg, #8A4FFF 0%, #4F8AFF 100%)",
        "cyberpunk-gradient": "linear-gradient(135deg, #080808 0%, #101630 100%)",
        "cyberpunk-accent": "linear-gradient(135deg, #B026FF 0%, #3D85FF 100%)",
        "aurora-gradient": "linear-gradient(135deg, #121218 0%, #1A1E2E 100%)",
        "aurora-accent": "linear-gradient(135deg, #7B68EE 0%, #64A8FF 100%)",
        "primary-gradient": "var(--primary-gradient)",
        "accent-gradient": "var(--accent-gradient)",
      },
      boxShadow: {
        "cosmic-glow": "0 0 15px rgba(138, 79, 255, 0.5)",
        "cyberpunk-glow": "0 0 15px rgba(176, 38, 255, 0.7)",
        "aurora-glow": "0 0 15px rgba(123, 104, 238, 0.4)",
        DEFAULT: "var(--box-shadow)",
        "neon-glow": "0 0 20px rgba(0, 242, 255, 0.5)",
        "neon-glow-strong": "0 0 30px rgba(0, 242, 255, 0.8)",
        "purple-glow": "0 0 20px rgba(123, 47, 247, 0.5)",
      },
      backdropFilter: {
        "blur-sm": "blur(4px)",
        "blur": "blur(8px)",
        "blur-md": "blur(12px)",
        "blur-lg": "blur(16px)",
      },
    },
  },
  plugins: [
    tailwindcssAnimate,
  ],
} satisfies Config;
