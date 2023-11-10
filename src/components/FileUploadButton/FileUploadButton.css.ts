import { style } from "@vanilla-extract/css";

export const fileUploadBoxStyles = style({
  backgroundColor: "#2c2c31",
  borderRadius: "5px",
  color: "white",
  display: "inline-block",
  padding: "15px 35px",
  cursor: "pointer",
  ":hover": {
    backgroundColor: "#36363b",
  },
});

export const fileInputStyles = style({
  display: "none",
});
