import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FAFAF9",
        }}
      >
        <svg
          width="150"
          height="150"
          viewBox="0 0 100 100"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g transform="translate(50 52) rotate(-30)">
            <path d="M -6 22 Q -3 34 0 40 Q 3 34 6 22 Z" fill="#FFA500" />
            <path d="M -3 22 Q -1 32 0 36 Q 1 32 3 22 Z" fill="#FFE066" />
            <path
              d="M -9 -14 L -9 20 L 9 20 L 9 -14 Q 9 -30 0 -40 Q -9 -30 -9 -14 Z"
              fill="#1F2937"
            />
            <circle cx="0" cy="-6" r="4.5" fill="#4FD1C5" />
            <circle
              cx="0"
              cy="-6"
              r="4.5"
              fill="none"
              stroke="#0F172A"
              strokeWidth="1.2"
            />
            <path d="M -9 10 L -19 22 L -9 20 Z" fill="#FF6B35" />
            <path d="M 9 10 L 19 22 L 9 20 Z" fill="#FF6B35" />
          </g>
        </svg>
      </div>
    ),
    { ...size }
  );
}
