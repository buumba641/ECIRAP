export function ECIRAPLogo({ size = 24, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Outer gradient circle */}
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e3a8a" />
          <stop offset="100%" stopColor="#0c4a6e" />
        </linearGradient>
        <linearGradient id="accentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#d97706" />
        </linearGradient>
      </defs>

      {/* Background circle */}
      <circle cx="50" cy="50" r="48" fill="url(#logoGradient)" />

      {/* Accent ring */}
      <circle cx="50" cy="50" r="48" fill="none" stroke="url(#accentGradient)" strokeWidth="2" />

      {/* Stylized geometric shape - ascending arrows representing growth */}
      <g transform="translate(50, 50)">
        {/* Arrow 1 - bottom left */}
        <path
          d="M -15 8 L -12 2 L -10 8"
          stroke="white"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Arrow 2 - center */}
        <path
          d="M -2 12 L 2 2 L 6 12"
          stroke="white"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Arrow 3 - right */}
        <path
          d="M 12 8 L 16 -2 L 20 8"
          stroke="url(#accentGradient)"
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* E - base letter */}
        <text
          x="-22"
          y="8"
          fontSize="14"
          fontWeight="700"
          fill="white"
          fontFamily="system-ui, -apple-system, sans-serif"
          textAnchor="end"
        >
          E
        </text>
      </g>

      {/* Decorative accent dot */}
      <circle cx="75" cy="25" r="3" fill="url(#accentGradient)" />
    </svg>
  )
}
