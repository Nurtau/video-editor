import type { SVGProps } from "react";
export function Cursor(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="none"
      viewBox="0 0 22 28"
      {...props}
    >
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2.113}
        d="M2.164 3.048 2 24.938c0 .216.062.427.18.605s.286.313.48.39a1 1 0 0 0 .61.035c.2-.053.382-.169.518-.332l5.698-6.8c.098-.117.22-.21.356-.272a1 1 0 0 1 .434-.093l8.687.161a1 1 0 0 0 .585-.178 1.05 1.05 0 0 0 .382-.493c.076-.2.09-.421.042-.63s-.157-.4-.313-.544L3.86 2.266a.986.986 0 0 0-1.09-.175 1.03 1.03 0 0 0-.439.387c-.107.17-.165.368-.166.57"
      />
    </svg>
  );
}
