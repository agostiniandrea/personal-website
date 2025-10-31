"use client";

import { useEffect } from "react";

interface CarbonBadgeProps {
  className?: string;
}

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
const CarbonBadge: React.FC<CarbonBadgeProps> = ({ className }) => {
  useEffect(() => {
    // Check if script is already loaded
    const existingScript = document.querySelector(
      'script[src*="website-carbon-badges"]'
    );
    
    if (!existingScript) {
      // Load the script
      const script = document.createElement("script");
      script.src = "https://unpkg.com/website-carbon-badges@1.1.3/b.min.js";
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  return <div id="wcb" className={`carbonbadge  wcb-d ${className || ""}`} />;
};

export default CarbonBadge;
