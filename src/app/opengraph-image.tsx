import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "BULLOBUILD — Authorized Professional Tools";
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
          backgroundColor: "#0a1628",
          backgroundImage:
            "radial-gradient(circle at 50% 45%, #1a2a4a 0%, #0a1628 70%)",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Yellow top bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "8px",
            backgroundColor: "#F2B705",
          }}
        />

        {/* Logo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://bullobuild.com/logo.png"
          alt="BULLOBUILD"
          width={1112}
          height={489}
          style={{
            width: "780px",
            height: "auto",
            objectFit: "contain",
            marginBottom: "36px",
          }}
        />

        {/* Tagline */}
        <div
          style={{
            fontSize: "28px",
            color: "#F2B705",
            fontWeight: 800,
            textTransform: "uppercase",
            letterSpacing: "0.2em",
            marginBottom: "18px",
          }}
        >
          Authorized Distributor
        </div>

        <div
          style={{
            fontSize: "22px",
            color: "rgba(255,255,255,0.78)",
            textAlign: "center",
            maxWidth: "820px",
            lineHeight: 1.4,
          }}
        >
          Professional tools from DeWalt, Milwaukee, Snap-on, Mac Tools, Craftsman & more
        </div>

        {/* Yellow bottom bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "8px",
            backgroundColor: "#F2B705",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
