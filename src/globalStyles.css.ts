import { globalStyle } from "@vanilla-extract/css";
import { tokens } from "./ui-tokens";

globalStyle("*", {
  margin: 0,
  padding: 0,
  boxSizing: "border-box",
  fontFamily: "Helvetica",
});

globalStyle("html, body, #root", {
  width: "100%",
  height: "100%",
  backgroundColor: tokens.colors["main-bg"],
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
