import type { SVGProps } from "react";
export function Export(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="none"
      viewBox="0 0 27 27"
      {...props}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.688}
        d="m9.07 8.648 4.43-4.43 4.43 4.43M13.5 16.031V4.22M22.781 16.031v5.907a.843.843 0 0 1-.843.843H5.063a.843.843 0 0 1-.844-.843V16.03"
      />
    </svg>
  );
}
