import { type ReactNode } from "react";

import { fileUploadBoxStyles, fileInputStyles } from "./FileUploadButton.css";

interface FileUploadButtonProps {
  onUpload(file: File): void;
  children: ReactNode;
}

export const FileUploadButton = ({
  onUpload,
  children,
}: FileUploadButtonProps) => {
  return (
    <label className={fileUploadBoxStyles}>
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
