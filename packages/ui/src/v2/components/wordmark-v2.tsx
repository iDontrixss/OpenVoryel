import { createUniqueId, type ComponentProps } from "solid-js"

export function WordmarkV2(props: Pick<ComponentProps<"svg">, "class">) {
  const mask = createUniqueId()
  const maskGradient = createUniqueId()

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 905 129"
      fill="none"
      classList={{ [props.class ?? ""]: !!props.class }}
    >
      <g opacity="1">
        <g mask={`url(#${mask})`}>
          <g opacity="0.5">
            <g fill="currentColor">
              {/* O */}
              <path
                opacity="0.7"
                d="M55.3846 36.4286H18.4615V91.7143H55.3846V36.4286ZM73.8462 110.143H0V18H73.8462V110.143Z"
              />
              {/* P */}
              <path
                opacity="0.7"
                d="M110.462 91.7143H147.385V36.4286H110.462V91.7143ZM165.846 110.143H110.462V128.571H92V18H165.846V110.143Z"
              />
              {/* E */}
              <path
                opacity="0.7"
                d="M258.47 73.29H203.08V91.71H258.47V110.14H184.62V18H258.47V73.29ZM203.08 54.86H240V36.43H203.08V54.86Z"
              />
              {/* N */}
              <path
                opacity="0.7"
                d="M276.92 18H295.38V110.14H276.92V18ZM332.31 18H350.77V110.14H332.31V18ZM295.38 36.43H313.85V73.29H295.38V36.43ZM313.85 73.29H332.31V91.71H313.85V73.29Z"
              />
            </g>
            <g fill="#7c3aed">
              {/* V */}
              <path
                opacity="0.7"
                d="M369.23 18H387.69V73.29H369.23V18ZM424.62 18H443.08V73.29H424.62V18ZM387.69 73.29H424.62V91.71H387.69V73.29ZM396.92 91.71H415.38V110.14H396.92V91.71Z"
              />
              {/* O */}
              <path
                opacity="0.7"
                d="M516.92 36.43H480V91.71H516.92V36.43ZM535.38 110.14H461.54V18H535.38V110.14Z"
              />
              {/* R */}
              <path
                opacity="0.7"
                d="M553.85 18H572.31V110.14H553.85V18ZM553.85 18H627.69V36.43H553.85V18ZM609.23 18H627.69V73.29H609.23V18ZM553.85 54.86H627.69V73.29H553.85V54.86ZM590.77 73.29H609.23V91.71H590.77V73.29ZM609.23 91.71H627.69V110.14H609.23V91.71Z"
              />
              {/* Y */}
              <path
                opacity="0.7"
                d="M646.15 18H664.62V54.86H646.15V18ZM701.54 18H720V54.86H701.54V18ZM646.15 54.86H720V73.29H646.15V54.86ZM673.85 73.29H692.31V110.14H673.85V73.29Z"
              />
              {/* E */}
              <path
                opacity="0.7"
                d="M812.31 73.29H756.92V91.71H812.31V110.14H738.46V18H812.31V73.29ZM756.92 54.86H793.85V36.43H756.92V54.86Z"
              />
              {/* L */}
              <path
                opacity="0.7"
                d="M830.77 18H849.23V110.14H830.77V18ZM830.77 91.71H904.62V110.14H830.77V91.71Z"
              />
            </g>
          </g>
        </g>
      </g>
      <defs>
        <mask id={mask} style="mask-type:alpha" maskUnits="userSpaceOnUse" x="0" y="0" width="905" height="129">
          <rect width="905" height="129" fill={`url(#${maskGradient})`} />
        </mask>
        <linearGradient id={maskGradient} x1="452" y1="68" x2="452" y2="129" gradientUnits="userSpaceOnUse">
          <stop stop-color="white" stop-opacity="0.7" />
          <stop offset="1" stop-color="white" stop-opacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}
