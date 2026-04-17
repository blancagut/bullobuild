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
        }}
      >
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
      </div>
    ),
    { ...size }
  );
}
