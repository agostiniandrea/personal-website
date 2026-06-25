import { useEffect, useState } from "react";
import styled from "styled-components";

const CONSENT_KEY = "cookie-consent";
type ConsentValue = "accepted" | "rejected" | "custom";

const Card = styled.div`
  position: fixed;
  bottom: 1.5rem;
  left: 1.5rem;
  z-index: 9000;
  width: calc(100% - 3rem);
  max-width: 420px;
  background: ${({ theme }) => theme.colors.surface};
  border: 1px solid ${({ theme }) => theme.colors.main};
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04);
  overflow: hidden;

  @media (max-width: 599px) {
    left: 1rem;
    bottom: 1rem;
    width: calc(100% - 2rem);
    max-width: none;
  }
`;

const AccentBar = styled.div`
  height: 3px;
  background: ${({ theme }) => theme.colors.highlight};
`;

const Content = styled.div`
  padding: 1.25rem 1.5rem 1.5rem;
`;

const Eyebrow = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.highlight};
  margin: 0 0 0.5rem;
`;

const Title = styled.h2`
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.headline};
  margin: 0 0 0.625rem;
`;

const Body = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.secondary};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  margin: 0 0 1.25rem;
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const AcceptButton = styled.button`
  width: 100%;
  padding: 0.625rem 1rem;
  background: ${({ theme }) => theme.colors.button};
  color: ${({ theme }) => theme.colors.button_text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.xs};
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover { opacity: 0.85; }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.button};
    outline-offset: 2px;
  }
`;

const RejectButton = styled.button`
  width: 100%;
  padding: 0.625rem 1rem;
  background: transparent;
  color: ${({ theme }) => theme.colors.secondary};
  border: 1px solid ${({ theme }) => theme.colors.main};
  border-radius: ${({ theme }) => theme.radii.xs};
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  cursor: pointer;
  transition: opacity 0.2s ease;

  &:hover { opacity: 0.7; }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.main};
    outline-offset: 2px;
  }
`;

const ManageButton = styled.button`
  width: 100%;
  padding: 0.375rem 1rem;
  background: transparent;
  color: ${({ theme }) => theme.colors.secondary};
  border: none;
  font-family: ${({ theme }) => theme.fontFamilies.body};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  cursor: pointer;
  text-decoration: underline;
  text-underline-offset: 2px;
  transition: opacity 0.2s ease;

  &:hover { opacity: 0.7; }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.main};
    outline-offset: 2px;
    border-radius: 2px;
  }
`;

const PreferencesPanel = styled.div`
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid ${({ theme }) => theme.colors.main};
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const PreferenceRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
`;

const PreferenceLabel = styled.div``;

const PreferenceName = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.headline};
  margin: 0 0 0.125rem;
`;

const PreferenceDesc = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.secondary};
  margin: 0;
`;

const Toggle = styled.button<{ $on: boolean; $disabled?: boolean }>`
  flex-shrink: 0;
  width: 2.5rem;
  height: 1.375rem;
  border-radius: 999px;
  border: none;
  background: ${({ $on, $disabled, theme }) =>
    $disabled ? theme.colors.main : $on ? theme.colors.highlight : theme.colors.main};
  position: relative;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  transition: background 0.2s ease;

  &::after {
    content: "";
    position: absolute;
    top: 2px;
    left: ${({ $on }) => ($on ? "calc(100% - 1.125rem)" : "2px")};
    width: 1rem;
    height: 1rem;
    border-radius: 50%;
    background: white;
    transition: left 0.2s ease;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: 2px;
  }
`;

const CookieBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsOn, setAnalyticsOn] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem(CONSENT_KEY)) setVisible(true);
  }, []);

  const save = (value: ConsentValue, analytics: boolean) => {
    localStorage.setItem(CONSENT_KEY, value);
    setVisible(false);
    if (analytics) window.dispatchEvent(new Event("cookie-consent-accepted"));
  };

  if (!visible) return null;

  return (
    <Card role="dialog" aria-modal="true" aria-labelledby="cookie-title" aria-describedby="cookie-desc">
      <AccentBar />
      <Content>
        <Eyebrow>Privacy</Eyebrow>
        <Title id="cookie-title">This site uses cookies</Title>
        <Body id="cookie-desc">
          Essential cookies keep the site working. Optional analytics cookies help me understand how visitors use this portfolio — no personal data sold, ever.
        </Body>

        {showPreferences && (
          <PreferencesPanel>
            <PreferenceRow>
              <PreferenceLabel>
                <PreferenceName>Essential</PreferenceName>
                <PreferenceDesc>Required for the site to function</PreferenceDesc>
              </PreferenceLabel>
              <Toggle $on={true} $disabled={true} aria-label="Essential cookies (always on)" aria-pressed={true} />
            </PreferenceRow>
            <PreferenceRow>
              <PreferenceLabel>
                <PreferenceName>Analytics</PreferenceName>
                <PreferenceDesc>Google Analytics — anonymous usage data</PreferenceDesc>
              </PreferenceLabel>
              <Toggle
                $on={analyticsOn}
                onClick={() => setAnalyticsOn((v) => !v)}
                aria-label={`Analytics cookies ${analyticsOn ? "on" : "off"}`}
                aria-pressed={analyticsOn}
              />
            </PreferenceRow>
          </PreferencesPanel>
        )}

        <Actions style={{ marginTop: showPreferences ? "1rem" : undefined }}>
          {showPreferences ? (
            <AcceptButton onClick={() => save("custom", analyticsOn)}>
              Save preferences
            </AcceptButton>
          ) : (
            <>
              <AcceptButton onClick={() => save("accepted", true)}>
                Accept all
              </AcceptButton>
              <RejectButton onClick={() => save("rejected", false)}>
                Reject non-essential
              </RejectButton>
            </>
          )}
          <ManageButton onClick={() => setShowPreferences((v) => !v)}>
            {showPreferences ? "Back" : "Manage preferences"}
          </ManageButton>
        </Actions>
      </Content>
    </Card>
  );
};

export default CookieBanner;
