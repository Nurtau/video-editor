import { type ReactNode } from "react";

import { fileInputStyles } from "./FileUploadButton.css";
import { buttonStyles, type ButtonStylesVariants } from "./Button.css";

type FileUploadButtonProps = {
  onUpload(file: File): void;
  children: ReactNode;
} & ButtonStylesVariants;

export const FileUploadButton = ({
  onUpload,
  children,
  variant = "primary",
}: FileUploadButtonProps) => {
  return (
    <label className={buttonStyles({ variant })}>
      <input
        className={fileInputStyles}
        type="file"
        accept="video/mp4"
        onChange={(event) => {
          const files = event.target.files;
          if (files && files.length > 0) {
            onUpload(files[0]);
          }
        }}
      ></input>
      {children}
    </label>
  );
};
