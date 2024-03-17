export const colors = {
  "main-bg": "rgba(23, 25, 37, 1)", //171925
  "secondary-bg": "rgba(35, 37, 48, 1)", //232530
  "secondary-border": "rgba(50, 52, 62, 1)", //32343E
  "tertiary-bg": "rgba(46, 48, 58, 1)", //2E303A
  "pale-blue": "rgba(112, 160, 173, 1)", //70A0AD
  "pale-gray": "rgba(123, 124, 131, 1)", //7B7C83
  "bright-blue": "rgba(109, 141, 255, 1)", //6D8DFF
  white100: "rgba(255, 255, 255, 1)",
  white80: "rgba(255, 255, 255, 0.8)",
  white50: "rgba(255, 255, 255, 0.5)",
  white25: "rgba(255, 255, 255, 0.25)",
  white15: "rgba(255, 255, 255, 0.15)",
  white10: "rgba(255, 255, 255, 0.10)",
  white5: "rgba(255, 255, 255, 0.05)",
  transparent: "transparent",
};

export type ColorName = keyof typeof colors;
