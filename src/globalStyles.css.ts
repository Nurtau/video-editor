import { globalStyle } from "@vanilla-extract/css";

globalStyle("*", {
  margin: 0,
  padding: 0,
  boxSizing: "border-box",
  fontFamily: "Helvetica",
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

globalStyle('input[type="file"]', {
  display: "none",
});

globalStyle(".custom-file-upload", {
  backgroundColor: "#2c2c31",
  borderRadius: "5px",
  color: "white",
  display: "inline-block",
  padding: "15px 35px",
  cursor: "pointer",
});

globalStyle(".custom-file-upload:hover", {
  backgroundColor: "#36363b",
});
