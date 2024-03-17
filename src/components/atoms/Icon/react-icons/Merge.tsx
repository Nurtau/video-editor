import type { SVGProps } from "react";
export function Merge(props: SVGProps<SVGSVGElement>) {
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
        d="M7.438 23.625a3.062 3.062 0 1 0 0-6.125 3.062 3.062 0 0 0 0 6.125M7.438 10.5a3.063 3.063 0 1 0 0-6.125 3.063 3.063 0 0 0 0 6.125M20.563 18.375a3.062 3.062 0 1 0 0-6.125 3.062 3.062 0 0 0 0 6.125"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M17.5 15.75h-3.227a5.23 5.23 0 0 1-4.035-1.892l-2.8-3.358v7"
      />
    </svg>
  );
}
