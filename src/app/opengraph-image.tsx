import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const alt = "Upeo Africa Technologies · Software, Design & Marketing";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  const markData = readFileSync(join(process.cwd(), "src/assets/upeo-mark.png"));
  const markSrc = `data:image/png;base64,${markData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0b0e14",
          padding: "72px",
          fontFamily: "sans-serif",
        }}
      >
        {/* top: mark + name */}
        <div style={{ display: "flex", alignItems: "center", gap: "22px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={markSrc} width={78} height={78} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: "30px",
                fontWeight: 700,
                letterSpacing: "6px",
                color: "#ffffff",
              }}
            >
              UPEO AFRICA
            </div>
            <div
              style={{
                fontSize: "17px",
                fontWeight: 600,
                letterSpacing: "10px",
                color: "rgba(255,255,255,0.5)",
                marginTop: "6px",
              }}
            >
              TECHNOLOGIES
            </div>
          </div>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              fontSize: "62px",
              fontWeight: 800,
              color: "#ffffff",
              lineHeight: 1.1,
              maxWidth: "960px",
            }}
          >
            <span>Software, design &amp; marketing that&nbsp;</span>
            <span style={{ color: "#f97316" }}>move your business forward</span>
          </div>
          <div
            style={{
              fontSize: "26px",
              color: "rgba(255,255,255,0.6)",
              marginTop: "28px",
            }}
          >
            A full-service digital agency · Mombasa, Kenya
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
