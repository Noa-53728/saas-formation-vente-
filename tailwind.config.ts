import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0F172A',
        accent: '#6D5CFF',
        'accent-light': '#8B7CFF',
        'accent-hover': '#5746FF',
        card: '#1E293B',
        success: '#22C55E',
      },
      backgroundImage: {
        'chart-gradient': 'linear-gradient(135deg, #6D5CFF 0%, #3B82F6 100%)',
      },
    }
  },
  plugins: []
};

export default config;
