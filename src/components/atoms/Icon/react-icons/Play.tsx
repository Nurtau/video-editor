import type { SVGProps } from "react";
export function Play(props: SVGProps<SVGSVGElement>) {
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
        d="M20.25 10.706 6 2.456A1.5 1.5 0 0 0 3.75 3.75v16.5A1.5 1.5 0 0 0 6 21.544l14.25-8.25a1.49 1.49 0 0 0 0-2.588"
      />
    </svg>
  );
}
