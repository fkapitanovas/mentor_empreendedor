import { ImageResponse } from "next/og";

export const alt = "Max Impulso — Mentor Empreendedor para microempreendedores brasileiros";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          padding: "72px",
          background:
            "linear-gradient(135deg, #FAFAF9 0%, #FFF6EC 55%, #FFE8D6 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 120,
              height: 120,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#FFFFFF",
              border: "1px solid #E7E5E0",
              borderRadius: 28,
            }}
          >
            <svg
              width="92"
              height="92"
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
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: 44,
                fontWeight: 800,
                color: "#1F2937",
                letterSpacing: "-0.02em",
                lineHeight: 1,
              }}
            >
              <span style={{ fontWeight: 900 }}>MAX</span>
              <span style={{ width: 14 }} />
              <span style={{ fontWeight: 300, letterSpacing: "0.08em" }}>
                IMPULSO
              </span>
            </div>
            <div
              style={{
                fontSize: 22,
                color: "#78716C",
                marginTop: 10,
              }}
            >
              Mentor virtual para empreendedores
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 72,
            fontWeight: 800,
            color: "#1A1A17",
            lineHeight: 1.05,
            letterSpacing: "-0.02em",
            maxWidth: 940,
          }}
        >
          Seu mentor de negócios, a qualquer hora.
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 28,
            color: "#57534E",
            marginTop: 28,
            maxWidth: 940,
            lineHeight: 1.4,
          }}
        >
          MEI, precificação, vendas, formalização. Direto ao ponto, em português.
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 40,
            padding: "10px 18px",
            background: "#FF6B35",
            borderRadius: 999,
            fontSize: 20,
            fontWeight: 700,
            color: "#FFFFFF",
          }}
        >
          maximpulso.com.br
        </div>
      </div>
    ),
    { ...size }
  );
}
