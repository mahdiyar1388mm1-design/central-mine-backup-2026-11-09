import { useId } from "react";
import { cn } from "../utils/cn";

/**
 * نشان CENTRAL MINE — بازسازی برداری لوگو:
 * کاشی صورتی براق + فلش پررنگ با خط‌مشی مشکی به سمت پایین‌چپ + نشان‌واره «CENTRAL MINE».
 */
const ARROW_PATH = "M43 72V46M43 72h29M43 72 80 32";

export function Logo({
  variant = "mark",
  title,
  className,
}: {
  variant?: "mark" | "full";
  title?: string;
  className?: string;
}) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "");
  const tileId = `cm-tile-${uid}`;
  const glossId = `cm-gloss-${uid}`;
  const arrowId = `cm-arrow-${uid}`;

  return (
    <svg
      viewBox="0 0 120 120"
      className={cn("block shrink-0", className)}
      role={title ? "img" : undefined}
      aria-label={title}
      aria-hidden={title ? undefined : true}
    >
      <defs>
        <linearGradient id={tileId} x1="14" y1="8" x2="108" y2="114" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fdc9df" />
          <stop offset="0.5" stopColor="#f6a3ca" />
          <stop offset="1" stopColor="#eb7fb4" />
        </linearGradient>
        <linearGradient id={glossId} x1="24" y1="6" x2="72" y2="62" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.62" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={arrowId} x1="38" y1="32" x2="84" y2="78" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#fa279f" />
          <stop offset="1" stopColor="#e30d84" />
        </linearGradient>
      </defs>

      {/* کاشی صورتی */}
      <rect x="1.5" y="1.5" width="117" height="117" rx="27" fill={`url(#${tileId})`} />
      <rect x="1.5" y="1.5" width="117" height="117" rx="27" fill={`url(#${glossId})`} />
      <rect
        x="1.5"
        y="1.5"
        width="117"
        height="117"
        rx="27"
        fill="none"
        stroke="#e07cab"
        strokeOpacity="0.5"
        strokeWidth="1.4"
      />

      {/* فلش: خط‌مشی مشکی زیر، تنه سرخابی روی آن */}
      <g transform={variant === "mark" ? "translate(0 7)" : undefined}>
        <path
          d={ARROW_PATH}
          fill="none"
          stroke="#121212"
          strokeWidth="15.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d={ARROW_PATH}
          fill="none"
          stroke={`url(#${arrowId})`}
          strokeWidth="11.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {variant === "full" && (
        <g
          fontFamily="'Space Grotesk', 'Vazirmatn', sans-serif"
          fontWeight={700}
          fontSize={11.5}
          textAnchor="middle"
        >
          <text x="60" y="98.7" textLength="98" lengthAdjust="spacing" fill="#121212" fillOpacity="0.3">
            CENTRAL MINE
          </text>
          <text x="60" y="97" textLength="98" lengthAdjust="spacing" fill="#ffffff">
            CENTRAL MINE
          </text>
        </g>
      )}
    </svg>
  );
}

export default Logo;
