import { ImageResponse } from "next/og";

import { getOgFonts } from "@lib/utils/ogFonts";
import { LOGO_SYMBOL_ASPECT, LOGO_SYMBOL_DATA_URI } from "@lib/utils/ogLogo";

export const config = {
  runtime: "edge",
};

const WIDTH = 1200;
const HEIGHT = 630;

const LOGO_WIDTH = 380;
const LOGO_HEIGHT = Math.round(LOGO_WIDTH / LOGO_SYMBOL_ASPECT);

/* One card for the whole site. It takes no query parameters on purpose:
   a `?title=` would let anyone render arbitrary text on this domain. */
export default function handler() {
  return new ImageResponse(
    <div
      style={{
        width: `${WIDTH}px`,
        height: `${HEIGHT}px`,
        display: "flex",
        position: "relative",
        background: "#07100f",
        fontFamily: "Inter",
      }}
    >
      {/* soft teal glow behind the mark */}
      <div
        style={{
          position: "absolute",
          top: "-120px",
          right: "-140px",
          width: "820px",
          height: "820px",
          display: "flex",
          backgroundImage:
            "radial-gradient(circle, rgba(47,138,130,0.55) 0%, rgba(47,138,130,0) 68%)",
        }}
      />

      {/* text column */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 0 72px 88px",
          width: "700px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontSize: "22px",
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            color: "#6ff0dc",
          }}
        >
          agostiniandrea.dev
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontFamily: "Space Grotesk",
              fontSize: "92px",
              fontWeight: 700,
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
              color: "#ffffff",
              marginBottom: "28px",
            }}
          >
            <div style={{ display: "flex" }}>Andrea</div>
            <div style={{ display: "flex" }}>Agostini</div>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: "34px",
              lineHeight: 1.35,
              color: "#a7c4c0",
            }}
          >
            <div style={{ display: "flex" }}>Senior Frontend Developer</div>
            <div style={{ display: "flex" }}>& Tech Lead</div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: "22px",
            letterSpacing: "0.04em",
            color: "#6f8f8b",
          }}
        >
          Bangkok, Thailand
        </div>
      </div>

      {/* brand mark */}
      <div
        style={{
          position: "absolute",
          top: `${(HEIGHT - LOGO_HEIGHT) / 2}px`,
          right: "84px",
          width: `${LOGO_WIDTH}px`,
          height: `${LOGO_HEIGHT}px`,
          display: "flex",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={LOGO_SYMBOL_DATA_URI}
          width={LOGO_WIDTH}
          height={LOGO_HEIGHT}
          alt=""
        />
      </div>

      {/* bottom accent line */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "6px",
          display: "flex",
          backgroundImage: "linear-gradient(90deg, #2f8a82, #6ff0dc)",
        }}
      />
    </div>,
    { width: WIDTH, height: HEIGHT, fonts: getOgFonts() },
  );
}
