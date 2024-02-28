import type { SVGProps } from "react";
export function PaintBrush(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="none"
      viewBox="0 0 27 30"
      {...props}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.688}
        d="M2.11 24.536h7.593a5.25 5.25 0 0 0 3.047-.985 5.8 5.8 0 0 0 2.02-2.623 6.2 6.2 0 0 0 .312-3.377 5.97 5.97 0 0 0-1.5-2.992 5.4 5.4 0 0 0-2.809-1.6 5.17 5.17 0 0 0-3.169.333 5.58 5.58 0 0 0-2.461 2.153 6.1 6.1 0 0 0-.924 3.246c0 4.046-2.11 5.845-2.11 5.845"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.688}
        d="M11.855 13.32c2.025-2.912 7.172-9.577 11.875-9.577 0 5.013-6.254 10.498-8.985 12.656"
      />
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.688}
        d="M14.027 10.442a9.3 9.3 0 0 1 3.418 3.641"
      />
    </svg>
  );
}
