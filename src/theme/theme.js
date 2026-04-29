export const darkColors = {
  // Brand
  primary: "#4F7CFF",     // Electric Indigo
  accent: "#FF8C42",      // Soft Orange
  
  // Status
  success: "#30D158",
  warning: "#F5A623",     // Expiring (Yellow/Orange)
  danger: "#FF453A",      // Expired (Red)
  
  // Translucents for glows/backgrounds
  primaryLight: "rgba(79, 124, 255, 0.12)",
  warningLight: "rgba(245, 166, 35, 0.12)",
  dangerLight: "rgba(255, 69, 58, 0.12)",
  
  // Layout (Matte Graphite)
  background: "#0B0D10",          // Dark charcoal background
  surface: "#16181D",             // Soft tonal surface
  surfaceElevated: "#1E2129",     // Higher elevation surface
  
  // Text
  text: "#FFFFFF",
  textMuted: "#A0A5B5",           // Cooler grey
  textSecondary: "#6E7489",       // Even lighter for hints
  
  // Borders (Minimal)
  border: "rgba(255, 255, 255, 0.06)",
  borderHighlight: "rgba(255, 255, 255, 0.10)",
  
  // Shadows
  shadowColor: "#000000",
  
  // Ad Banner
  adBg: "rgba(79, 124, 255, 0.06)",
  adBorder: "rgba(79, 124, 255, 0.15)",
};

export const lightColors = {
  // Brand
  primary: "#3D6AE8",     // Deeper indigo for contrast on white
  accent: "#E87B30",      // Richer orange

  // Status
  success: "#2DA44E",
  warning: "#D4850C",
  danger: "#CF222E",
  
  // Translucents for backgrounds
  primaryLight: "rgba(61, 106, 232, 0.08)",
  warningLight: "rgba(212, 133, 12, 0.08)",
  dangerLight: "rgba(207, 34, 46, 0.08)",
  
  // Layout (Clean Light — proper contrast hierarchy)
  background: "#F0F1F3",          // Cool grey canvas
  surface: "#FFFFFF",             // Pure white cards
  surfaceElevated: "#FFFFFF",     // Also white (elevation via shadow, not color)
  
  // Text
  text: "#1A1C22",               // Near-black for readability
  textMuted: "#6B7082",          // Medium grey
  textSecondary: "#9CA0AE",      // Light hints
  
  // Borders — visible enough to define card edges on light bg
  border: "rgba(0, 0, 0, 0.08)",
  borderHighlight: "rgba(0, 0, 0, 0.14)",
  
  // Shadows
  shadowColor: "rgba(0, 0, 0, 0.12)",
  
  // Ad Banner
  adBg: "rgba(61, 106, 232, 0.04)",
  adBorder: "rgba(61, 106, 232, 0.12)",
};
