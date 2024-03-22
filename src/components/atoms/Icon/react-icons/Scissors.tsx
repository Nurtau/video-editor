import type { SVGProps } from "react";
export function Scissors(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="1em"
      height="1em"
      fill="none"
      viewBox="0 0 30 24"
      {...props}
    >
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        filter="url(#scissors_svg__a)"
      >
        <path d="M11.375 21.438a3.062 3.062 0 1 0-6.125 0 3.062 3.062 0 0 0 6.125 0M22.75 21.438a3.062 3.062 0 1 0-6.125 0 3.062 3.062 0 0 0 6.125 0M14 13.125l3.96 5.786M6.814 2.625l5.064 7.405M21.186 2.625 10.041 18.911" />
      </g>
      <defs>
        <filter
          id="scissors_svg__a"
          width={36}
          height={36}
          x={0}
          y={0}
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            result="hardAlpha"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
          />
          <feOffset dy={4} />
          <feGaussianBlur stdDeviation={2} />
          <feComposite in2="hardAlpha" operator="out" />
          <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
          <feBlend
            in2="BackgroundImageFix"
            result="effect1_dropShadow_80_136"
          />
          <feBlend
            in="SourceGraphic"
            in2="effect1_dropShadow_80_136"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
}
