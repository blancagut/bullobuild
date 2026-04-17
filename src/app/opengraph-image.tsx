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
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F2B705",
          fontFamily: "system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* Bull mascot */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="https://bullobuild.com/favicon.png"
          alt="BULLOBUILD"
          width={630}
          height={630}
          style={{
            width: "560px",
            height: "560px",
            objectFit: "contain",
          }}
        />

        {/* Right-side wordmark + tagline */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginLeft: "32px",
            maxWidth: "540px",
          }}
        >
          <div
            style={{
              fontSize: "92px",
              fontWeight: 900,
              color: "#1a1a1a",
              letterSpacing: "-0.02em",
              lineHeight: 1,
              marginBottom: "18px",
            }}
          >
            BULLOBUILD
          </div>
          <div
            style={{
              fontSize: "26px",
              color: "#1a1a1a",
              fontWeight: 800,
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              marginBottom: "20px",
            }}
          >
            Authorized Distributor
          </div>
          <div
            style={{
              fontSize: "22px",
              color: "rgba(26,26,26,0.78)",
              lineHeight: 1.4,
            }}
          >
            Professional tools from DeWalt, Milwaukee, Snap-on, Mac Tools, Craftsman & more
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
