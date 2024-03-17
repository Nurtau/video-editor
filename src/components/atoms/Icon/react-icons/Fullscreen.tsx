import type { SVGProps } from "react";
export function Fullscreen(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="none"
      viewBox="0 0 24 24"
      {...props}
    >
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
      >
        <path d="M15.75 4.5h3.75v3.75M8.25 19.5H4.5v-3.75M19.5 15.75v3.75h-3.75M4.5 8.25V4.5h3.75" />
      </g>
    </svg>
  );
}
