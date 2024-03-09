import type { SVGProps } from "react";
export function Pause(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        fill="currentColor"
        d="M18.75 3.75h-3.375a.75.75 0 0 0-.75.75v15c0 .414.336.75.75.75h3.375a.75.75 0 0 0 .75-.75v-15a.75.75 0 0 0-.75-.75M8.625 3.75H5.25a.75.75 0 0 0-.75.75v15c0 .414.336.75.75.75h3.375a.75.75 0 0 0 .75-.75v-15a.75.75 0 0 0-.75-.75"
      />
    </svg>
  );
}
