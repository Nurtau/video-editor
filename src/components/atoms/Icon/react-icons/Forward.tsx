import type { SVGProps } from "react";
export function Forward(props: SVGProps<SVGSVGElement>) {
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
        <path d="M22.64 11.372 14.279 5.99a.75.75 0 0 0-1.153.637v10.744a.75.75 0 0 0 1.153.637l8.363-5.38a.74.74 0 0 0 0-1.257M12.14 11.372 3.779 5.99a.75.75 0 0 0-1.153.637v10.744a.75.75 0 0 0 1.153.637l8.363-5.38a.74.74 0 0 0 0-1.257" />
      </g>
    </svg>
  );
}
