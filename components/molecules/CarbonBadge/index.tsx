"use client";

import { useEffect } from "react";
import { Box } from "@components/ions";

interface CarbonBadgeProps {
  className?: string;
}

const CarbonBadge: React.FC<CarbonBadgeProps> = ({ className }) => {
  useEffect(() => {
    if (window.location.hostname === "localhost") return;

    const existingScript = document.querySelector(
      'script[src*="website-carbon-badges"]'
    );

    if (!existingScript) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/website-carbon-badges@1.1.3/b.min.js";
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  return (
    <Box styles="#wcb_2 { display: none !important; }">
      <div id="wcb" className={`carbonbadge wcb-d ${className || ""}`} />
    </Box>
  );
};

export default CarbonBadge;
