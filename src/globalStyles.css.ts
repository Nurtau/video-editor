import { globalStyle } from "@vanilla-extract/css";

globalStyle("*", {
  margin: 0,
  padding: 0,
  boxSizing: "border-box",
});

globalStyle("html, body, #root", {
  width: "100%",
  height: "100%",
});

globalStyle("::-webkit-scrollbar", {
  width: "5px",
  height: "3px",
});

globalStyle("::-webkit-scrollbar-thumb", {
  background: "rgba(90, 90, 90)",
});

globalStyle("::-webkit-scrollbar-track", {
  background: "rgba(0, 0, 0, 0.2)",
});
