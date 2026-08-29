export function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <line
        x1="14"
        y1="20"
        x2="14"
        y2="38"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect x="11" y="24" width="6" height="10" rx="1" fill="currentColor" />
      <line
        x1="24"
        y1="12"
        x2="24"
        y2="32"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect x="21" y="16" width="6" height="12" rx="1" fill="currentColor" />
      <line
        x1="34"
        y1="4"
        x2="34"
        y2="26"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect x="31" y="8" width="6" height="14" rx="1" fill="currentColor" />
    </svg>
  );
}