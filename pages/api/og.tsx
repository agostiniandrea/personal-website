import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const config = {
  runtime: "edge",
};

export default async function handler(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get("title") ?? "Andrea Agostini";
  const subtitle =
    searchParams.get("subtitle") ?? "Senior Frontend Developer & Tech Lead";

  const [interBold, interRegular] = await Promise.all([
    fetch(
      "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff2",
    ).then((r) => r.arrayBuffer()),
    fetch(
      "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2",
    ).then((r) => r.arrayBuffer()),
  ]);

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
          fontFamily: "Inter, sans-serif",
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
            height: "5px",
            background: "#3b82f6",
            display: "flex",
          }}
        />

        {/* label */}
        <div
          style={{
            fontSize: "15px",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#3b82f6",
            marginBottom: "32px",
            display: "flex",
            fontWeight: 400,
          }}
        >
          agostiniandrea.dev
        </div>

        {/* name */}
        <div
          style={{
            fontSize: "80px",
            fontWeight: 700,
            color: "#ffffff",
            lineHeight: 1.05,
            marginBottom: "28px",
            display: "flex",
            letterSpacing: "-0.02em",
          }}
        >
          {title}
        </div>

        {/* role */}
        <div
          style={{
            fontSize: "30px",
            color: "#a0a0b0",
            lineHeight: 1.4,
            display: "flex",
            fontWeight: 400,
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
            fontSize: "18px",
            color: "#6a6a80",
            letterSpacing: "0.04em",
            display: "flex",
            fontWeight: 400,
          }}
        >
          Bangkok, Thailand
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Inter", data: interRegular, weight: 400, style: "normal" },
        { name: "Inter", data: interBold, weight: 700, style: "normal" },
      ],
    },
  );
}
