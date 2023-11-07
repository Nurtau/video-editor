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
