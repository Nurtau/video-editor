import type { SVGProps } from "react";
export function Backward(props: SVGProps<SVGSVGElement>) {
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
        stroke="#fff"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        opacity={0.5}
      >
        <path d="M1.36 11.372 9.721 5.99a.75.75 0 0 1 1.153.637v10.744a.75.75 0 0 1-1.153.637l-8.363-5.38a.74.74 0 0 1 0-1.257M11.86 11.372l8.362-5.381a.75.75 0 0 1 1.153.637v10.744a.75.75 0 0 1-1.153.637l-8.363-5.38a.74.74 0 0 1 0-1.257" />
      </g>
    </svg>
  );
}
