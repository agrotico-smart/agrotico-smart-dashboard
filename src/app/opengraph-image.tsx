import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt =
  "Agrotico Smart Dashboard - Sistema de Monitoreo Agrícola Inteligente";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0057a3 0%, #00a86b 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Logo/Icon */}
        <div
          style={{
            fontSize: 120,
            marginBottom: 20,
          }}
        >
          🌱
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 64,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 20,
            maxWidth: "90%",
          }}
        >
          Agrotico Smart Dashboard
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontSize: 32,
            textAlign: "center",
            opacity: 0.9,
            maxWidth: "80%",
          }}
        >
          Sistema de Monitoreo Agrícola Inteligente con IA
        </div>

        {/* Bottom accent */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 8,
            background: "rgba(255, 255, 255, 0.3)",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
