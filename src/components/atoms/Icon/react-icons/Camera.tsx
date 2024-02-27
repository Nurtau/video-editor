import type { SVGProps } from "react";
export function Camera(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="none"
      viewBox="0 0 27 29"
      {...props}
    >
      <path
        stroke="#7B7C83"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.688}
        d="M2.531 6.88h13.5c.895 0 1.754.38 2.387 1.054a3.72 3.72 0 0 1 .988 2.543v10.79a.93.93 0 0 1-.247.636.82.82 0 0 1-.596.263h-13.5a3.27 3.27 0 0 1-2.387-1.053 3.72 3.72 0 0 1-.989-2.543V7.78a.93.93 0 0 1 .248-.636.82.82 0 0 1 .596-.263"
      />
      <path
        stroke="#7B7C83"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.688}
        d="m19.406 12.725 5.907-3.596v10.79l-5.907-3.597"
      />
    </svg>
  );
}
