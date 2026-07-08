import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styled from "styled-components";

const copy = {
  en: {
    eyebrow: "Privacy",
    title: "This site uses cookies",
    body: "Essential cookies keep the site working. Optional analytics help me understand how the portfolio is used and improve the experience.",
    acceptAll: "Accept all",
    rejectNonEssential: "Reject non-essential",
    managePreferences: "Manage preferences",
    savePreferences: "Save preferences",
    back: "Back",
    essential: "Essential",
    essentialDesc: "Required for the site to work",
    essentialAriaLabel: "Essential cookies, always on",
    analytics: "Analytics",
    analyticsDesc: "Anonymous usage data via Google Analytics",
    analyticsAriaOn: "Analytics cookies on",
    analyticsAriaOff: "Analytics cookies off",
  },
  it: {
    eyebrow: "Privacy",
    title: "Questo sito usa i cookie",
    body: "I cookie essenziali mantengono il sito funzionante. I cookie analitici facoltativi mi aiutano a capire come viene usato il portfolio e a migliorarlo.",
    acceptAll: "Accetta tutti",
    rejectNonEssential: "Rifiuta non essenziali",
    managePreferences: "Gestisci preferenze",
    savePreferences: "Salva preferenze",
    back: "Indietro",
    essential: "Essenziali",
    essentialDesc: "Necessari per il funzionamento del sito",
    essentialAriaLabel: "Cookie essenziali, sempre attivi",
    analytics: "Analitici",
    analyticsDesc: "Dati anonimi sull'utilizzo tramite Google Analytics",
    analyticsAriaOn: "Cookie analitici attivi",
    analyticsAriaOff: "Cookie analitici disattivi",
  },
};

const CONSENT_KEY = "cookie-consent";
type ConsentValue = "accepted" | "rejected" | "custom";

const Card = styled.div`
  position: fixed;
  bottom: 1.5rem;
  left: 1.5rem;
  z-index: 9000;
  width: calc(100% - 3rem);
  max-width: 440px;
  background: #ffffff;
  border: 1px solid #e0e0e8;
  border-top: 3px solid ${({ theme }) => theme.colors.highlight};
  border-radius: ${({ theme }) => theme.radii.md};
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);
  padding: 1.25rem 1.5rem 1.5rem;

  @media (max-width: 699px) {
    left: 1rem;
    right: 1rem;
    bottom: 1rem;
    width: auto;
    max-width: none;
    padding: 1rem 1.25rem 1.25rem;
  }
`;

const Eyebrow = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.highlight};
  margin: 0 0 0.375rem;
`;

const Title = styled.h2`
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: #0a0a0f;
  margin: 0 0 0.5rem;
`;

const Body = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: #5e5e72;
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  margin: 0;
`;

const Actions = styled.div`
  margin-top: 1.125rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;

  @media (max-width: 699px) {
    margin-top: 0.875rem;
    gap: 0.5rem;
  }
`;

const MainActions = styled.div`
  display: flex;
  gap: 0.625rem;
`;

const PrimaryBtn = styled.button`
  flex: 1;
  padding: 0.5rem 1rem;
  background: ${({ theme }) => theme.colors.button};
  color: ${({ theme }) => theme.colors.button_text};
  border: none;
  border-radius: ${({ theme }) => theme.radii.xs};
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.2s ease;

  &:hover { opacity: 0.85; }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.button};
    outline-offset: 2px;
  }
`;

const SecondaryBtn = styled.button`
  flex: 1;
  padding: 0.5rem 1rem;
  background: transparent;
  color: #0a0a0f;
  border: 1px solid ${({ theme }) => theme.colors.highlight}55;
  border-radius: ${({ theme }) => theme.radii.xs};
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.2s ease;

  &:hover { opacity: 0.7; }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: 2px;
  }
`;

const TextBtn = styled.button`
  background: none;
  border: none;
  padding: 0.25rem 0;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.highlight};
  cursor: pointer;
  text-align: left;
  transition: opacity 0.2s ease;

  &:hover { opacity: 0.7; }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: 2px;
    border-radius: 2px;
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #e0e0e8;
  margin: 1rem 0;
`;

const PreferenceRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;

  & + & { margin-top: 0.75rem; }
`;

const PreferenceName = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: #0a0a0f;
  margin: 0 0 0.125rem;
`;

const PreferenceDesc = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: #5e5e72;
  margin: 0;
`;

const Toggle = styled.button<{ $on: boolean; $disabled?: boolean }>`
  flex-shrink: 0;
  width: 2.25rem;
  height: 1.25rem;
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
    top: 3px;
    left: ${({ $on }) => ($on ? "1.125rem" : "3px")};
    width: 0.875rem;
    height: 0.875rem;
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
  const { locale } = useRouter();
  const t = locale === "it" ? copy.it : copy.en;

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
      <Eyebrow>{t.eyebrow}</Eyebrow>
      <Title id="cookie-title">{t.title}</Title>
      <Body id="cookie-desc">{t.body}</Body>

      <Actions>
        {showPreferences ? (
          <>
            <MainActions>
              <PrimaryBtn onClick={() => save("custom", analyticsOn)}>{t.savePreferences}</PrimaryBtn>
            </MainActions>
            <TextBtn onClick={() => setShowPreferences(false)}>{t.back}</TextBtn>
          </>
        ) : (
          <>
            <MainActions>
              <PrimaryBtn onClick={() => save("accepted", true)}>{t.acceptAll}</PrimaryBtn>
              <SecondaryBtn onClick={() => save("rejected", false)}>{t.rejectNonEssential}</SecondaryBtn>
            </MainActions>
            <TextBtn onClick={() => setShowPreferences(true)}>{t.managePreferences}</TextBtn>
          </>
        )}
      </Actions>

      {showPreferences && (
        <>
          <Divider />
          <PreferenceRow>
            <div>
              <PreferenceName>{t.essential}</PreferenceName>
              <PreferenceDesc>{t.essentialDesc}</PreferenceDesc>
            </div>
            <Toggle $on={true} $disabled={true} aria-label={t.essentialAriaLabel} aria-pressed={true} />
          </PreferenceRow>
          <PreferenceRow>
            <div>
              <PreferenceName>{t.analytics}</PreferenceName>
              <PreferenceDesc>{t.analyticsDesc}</PreferenceDesc>
            </div>
            <Toggle
              $on={analyticsOn}
              onClick={() => setAnalyticsOn((v) => !v)}
              aria-label={analyticsOn ? t.analyticsAriaOn : t.analyticsAriaOff}
              aria-pressed={analyticsOn}
            />
          </PreferenceRow>
        </>
      )}
    </Card>
  );
};

export default CookieBanner;
