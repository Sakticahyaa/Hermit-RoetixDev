interface Props {
  size?: number
  color?: string
}

export function HermitCrabIcon({ size = 24, color = 'currentColor' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shell — large rounded dome */}
      <path d="M17 5C11.5 5 8 9 8 14.5C8 21 12 27 17 27C22 27 26 21 26 14.5C26 9 22.5 5 17 5Z" />
      {/* Shell inner spiral */}
      <path d="M17 9C14 9 12 11.5 12 14.5C12 18 14.5 21 17 21C19.5 21 22 18 22 14.5C22 11.5 20 9 17 9Z" fill="rgba(0,0,0,0.18)" />
      <circle cx="17" cy="14.5" r="3.5" fill="rgba(0,0,0,0.22)" />

      {/* Body peeking out (left side) */}
      <ellipse cx="9" cy="15" rx="3" ry="2.5" />

      {/* Left big claw — upper pincer */}
      <path d="M7 13L3 10L5.5 14Z" />
      {/* Left big claw — lower pincer */}
      <path d="M7 17L3 20L6 17Z" />

      {/* Antennae */}
      <line x1="11" y1="8"  x2="8"  y2="3"  stroke={color} strokeWidth="1.8" strokeLinecap="round" />
      <line x1="13" y1="7"  x2="12" y2="2"  stroke={color} strokeWidth="1.5" strokeLinecap="round" />

      {/* Eyes */}
      <circle cx="9"  cy="12" r="1.2" fill="rgba(0,0,0,0.5)" />
      <circle cx="11" cy="11" r="1.2" fill="rgba(0,0,0,0.5)" />
    </svg>
  )
}
