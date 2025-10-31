"use client";

import { useEffect, useRef } from "react";
import styled from "styled-components";

interface CarbonBadgeProps {
  theme?: "light" | "dark" | "auto";
  className?: string;
}

const BadgeContainer = styled.div`
  display: inline-block;
  
  #wcb {
    /* Ensure badge is visible */
    min-height: 50px;
  }
`;

/**
 * Website Carbon Badge Component
 * 
 * Integrates the official Website Carbon Calculator badge
 * Documentation: https://www.websitecarbon.com/badge/
 * 
 * The badge automatically calculates and displays the carbon emissions
 * of the current page. Results are cached for 7 days and the badge
 * makes a maximum of one API call per day per page.
 */
const CarbonBadge: React.FC<CarbonBadgeProps> = ({
  theme = "auto",
  className,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptLoadedRef = useRef(false);

  useEffect(() => {
    // Only load script once
    if (scriptLoadedRef.current) return;

    // Determine theme
    let badgeTheme = theme;
    if (theme === "auto") {
      // Auto-detect theme based on body background color
      const bodyBg = window.getComputedStyle(document.body).backgroundColor;
      // Simple detection - if background is dark, use dark theme
      const isDark = bodyBg.includes("rgb(35, 41, 70)") || bodyBg.includes("#232946");
      badgeTheme = isDark ? "dark" : "light";
    }

    // Create container div if it doesn't exist
    if (containerRef.current && !document.getElementById("wcb")) {
      const badgeDiv = document.createElement("div");
      badgeDiv.id = "wcb";
      badgeDiv.className = badgeTheme === "dark" ? "carbonbadge wcb-d" : "carbonbadge";
      containerRef.current.appendChild(badgeDiv);

      // Load the Website Carbon badge script
      const script = document.createElement("script");
      script.src = "https://unpkg.com/[email protected]/b.min.js";
      script.defer = true;
      script.async = true;
      
      document.head.appendChild(script);
      scriptLoadedRef.current = true;

      // Cleanup function
      return () => {
        const existingBadge = document.getElementById("wcb");
        if (existingBadge) {
          existingBadge.remove();
        }
        const existingScript = document.querySelector(
          'script[src*="websitecarbon.com"]'
        );
        if (existingScript) {
          existingScript.remove();
        }
      };
    }
  }, [theme]);

  return <BadgeContainer ref={containerRef} className={className} />;
};

export default CarbonBadge;
