import { type ReactNode } from "react";

import { boxStyles, textStyles } from "./FeatureDetectionGuard.css";

interface FeatureDetectionGuardProps {
  children: ReactNode;
}

const ESSENTIAL_FEATURES = ["VideoEncoder", "VideoDecoder", "AudioDecoder"];

export const FeatureDetectionGuard = ({
  children,
}: FeatureDetectionGuardProps) => {
  const hasAllFeatures = ESSENTIAL_FEATURES.every(
    (feature) => feature in window,
  );

  if (hasAllFeatures) {
    return children;
  }

  return (
    <div className={boxStyles}>
      <div className={textStyles}>
        Unfortunately you can't access this video editor because your browser
        does not support at least one of {ESSENTIAL_FEATURES.join(", ")}{" "}
        features
      </div>
    </div>
  );
};
