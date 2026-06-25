import { useEffect, useState } from "react";
import styled from "styled-components";
import { Button, Text } from "@components/ions";

const CONSENT_KEY = "cookie-consent";

const Banner = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 9000;
  background: ${({ theme }) => theme.colors.surface};
  border-top: 1px solid ${({ theme }) => theme.colors.main};
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
`;

const Message = styled(Text)`
  margin: 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  max-width: 680px;
`;

const Actions = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-shrink: 0;
`;

const DeclineButton = styled(Button)`
  background: transparent;
  color: ${({ theme }) => theme.colors.secondary};
  border: 1px solid ${({ theme }) => theme.colors.main};

  &:hover {
    opacity: 0.7;
  }
`;

const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY);
    if (!consent) setVisible(true);
  }, []);

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "accepted");
    setVisible(false);
    window.dispatchEvent(new Event("cookie-consent-accepted"));
  };

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, "declined");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <Banner role="region" aria-label="Cookie consent">
      <Message>
        This site uses cookies for analytics (Google Analytics) to understand how visitors interact with it. You can accept or decline.
      </Message>
      <Actions>
        <DeclineButton onClick={decline}>Decline</DeclineButton>
        <Button onClick={accept}>Accept</Button>
      </Actions>
    </Banner>
  );
};

export default CookieBanner;
