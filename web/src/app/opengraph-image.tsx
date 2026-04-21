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
            "linear-gradient(135deg, #FFFDF7 0%, #F0FDF4 50%, #ECFDF5 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 36,
          }}
        >
          <div
            style={{
              width: 88,
              height: 88,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "linear-gradient(135deg, #10B981, #047857)",
              color: "#FFFFFF",
              fontSize: 56,
              fontWeight: 800,
              borderRadius: 20,
            }}
          >
            M
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 28,
                fontWeight: 600,
                color: "#059669",
                letterSpacing: "-0.01em",
              }}
            >
              Max Impulso
            </div>
            <div style={{ fontSize: 20, color: "#78716C" }}>
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
      </div>
    ),
    { ...size }
  );
}
