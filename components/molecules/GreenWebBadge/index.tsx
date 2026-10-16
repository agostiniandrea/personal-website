import React from "react";

import styled from "styled-components";

interface GreenWebBadgeProps {
  className?: string;
}

// The Green Web Foundation's "Green Hosting" badge for agostiniandrea.dev,
// saved as a static file (see public/assets). It is not hotlinked from
// app.greenweb.org: no third-party request on page view, and the image cannot
// change under the page. The link goes to the live check, so anyone can verify
// the claim. Re-save the PNG if the hosting provider ever changes.
const GREEN_WEB_CHECK_URL =
  "https://www.thegreenwebfoundation.org/green-web-check/?url=agostiniandrea.dev";

const BadgeLink = styled.a`
  display: inline-flex;
  line-height: 0;
`;

const BadgeImage = styled.img`
  height: auto;
  width: 120px;
`;

const GreenWebBadge: React.FC<GreenWebBadgeProps> = ({ className }) => (
  <BadgeLink
    className={className}
    href={GREEN_WEB_CHECK_URL}
    target="_blank"
    rel="noopener noreferrer"
  >
    <BadgeImage
      src="/assets/green-hosting-badge.png"
      alt="This website runs on green hosting – verified by thegreenwebfoundation.org"
      width={200}
      height={95}
      loading="lazy"
      decoding="async"
    />
  </BadgeLink>
);

export default GreenWebBadge;
