import type { SVGProps } from "react";
export function Trash(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="none"
      viewBox="0 0 28 28"
      {...props}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3.5 7h21M9.333 7V4.667a2.333 2.333 0 0 1 2.334-2.334h4.666a2.333 2.333 0 0 1 2.334 2.334V7m3.5 0v16.333a2.333 2.333 0 0 1-2.334 2.334H8.167a2.333 2.333 0 0 1-2.334-2.334V7zM11.667 12.833v7M16.333 12.833v7"
      />
    </svg>
  );
}
