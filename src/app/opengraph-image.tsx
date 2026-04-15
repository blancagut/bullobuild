import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ProTool Market — Authorized Professional Tools";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0B1F3A",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Background accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "6px",
            backgroundColor: "#F2B705",
          }}
        />

        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              backgroundColor: "#F2B705",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: 900,
              color: "#0B1F3A",
            }}
          >
            P
          </div>
          <div
            style={{
              fontSize: "52px",
              fontWeight: 900,
              color: "#FFFFFF",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            ProTool Market
          </div>
        </div>

        {/* Tagline */}
        <div
          style={{
            fontSize: "24px",
            color: "#F2B705",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.15em",
            marginBottom: "16px",
          }}
        >
          Authorized Distributor
        </div>

        <div
          style={{
            fontSize: "18px",
            color: "rgba(255,255,255,0.6)",
            textAlign: "center",
            maxWidth: "700px",
          }}
        >
          Buy and sell professional tools from trusted brands — DeWalt, Milwaukee, Snap-on & more
        </div>

        {/* Brands strip */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            marginTop: "40px",
            color: "rgba(255,255,255,0.3)",
            fontSize: "13px",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
          }}
        >
          {["DeWalt", "Milwaukee", "Snap-on", "Craftsman", "Stanley", "Mac Tools"].map((brand) => (
            <span key={brand}>{brand}</span>
          ))}
        </div>
      </div>
    ),
    { ...size }
  );
}
