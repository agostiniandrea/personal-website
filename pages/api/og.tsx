import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const config = {
  runtime: "edge",
};

export default function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") ?? "Andrea Agostini";
  const subtitle =
    searchParams.get("subtitle") ?? "Senior Frontend Developer & Tech Lead";

  return new ImageResponse(
    (
      <div
        style={{
          width: "1200px",
          height: "630px",
          background: "#0a0a0f",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px 96px",
          fontFamily: "Inter, system-ui, sans-serif",
          position: "relative",
        }}
      >
        {/* top accent line */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background:
              "linear-gradient(90deg, #3b82f6 0%, #1d4ed8 60%, transparent 100%)",
          }}
        />

        {/* label */}
        <div
          style={{
            fontSize: "14px",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#3b82f6",
            marginBottom: "28px",
            display: "flex",
          }}
        >
          andreaagostini.com
        </div>

        {/* name */}
        <div
          style={{
            fontSize: "72px",
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.1,
            marginBottom: "24px",
            display: "flex",
          }}
        >
          {title}
        </div>

        {/* role */}
        <div
          style={{
            fontSize: "28px",
            color: "#a0a0b0",
            lineHeight: 1.4,
            display: "flex",
          }}
        >
          {subtitle}
        </div>

        {/* location */}
        <div
          style={{
            position: "absolute",
            bottom: "64px",
            left: "96px",
            fontSize: "16px",
            color: "#a0a0b0",
            letterSpacing: "0.05em",
            display: "flex",
          }}
        >
          Bangkok, Thailand
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    },
  );
}
