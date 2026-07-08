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
  background: #ffffff;
  border: 1px solid #e0e0e8;
  border-radius: ${({ theme }) => theme.radii.md};
  border-top: 3px solid ${({ theme }) => theme.colors.highlight};
  bottom: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.16);
  left: 1.5rem;
  max-width: 440px;
  padding: 1.25rem 1.5rem 1.5rem;
  position: fixed;
  width: calc(100% - 3rem);
  z-index: 9000;

  @media (max-width: 699px) {
    bottom: 1rem;
    left: 1rem;
    max-width: none;
    padding: 1rem 1.25rem 1.25rem;
    right: 1rem;
    width: auto;
  }
`;

const Eyebrow = styled.p`
  color: ${({ theme }) => theme.colors.highlight};
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  letter-spacing: 0.15em;
  margin: 0 0 0.375rem;
  text-transform: uppercase;
`;

const Title = styled.h2`
  color: #0a0a0f;
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin: 0 0 0.5rem;
`;

const Body = styled.p`
  color: #5e5e72;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  margin: 0;
`;

const Actions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1.125rem;

  @media (max-width: 699px) {
    gap: 0.5rem;
    margin-top: 0.875rem;
  }
`;

const MainActions = styled.div`
  display: flex;
  gap: 0.625rem;
`;

const PrimaryBtn = styled.button`
  background: ${({ theme }) => theme.colors.button};
  border: none;
  border-radius: ${({ theme }) => theme.radii.xs};
  color: ${({ theme }) => theme.colors.button_text};
  cursor: pointer;
  flex: 1;
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  padding: 0.5rem 1rem;
  transition: opacity 0.2s ease;
  white-space: nowrap;

  &:hover { opacity: 0.85; }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.button};
    outline-offset: 2px;
  }
`;

const SecondaryBtn = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.colors.highlight}55;
  border-radius: ${({ theme }) => theme.radii.xs};
  color: #0a0a0f;
  cursor: pointer;
  flex: 1;
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  padding: 0.5rem 1rem;
  transition: opacity 0.2s ease;
  white-space: nowrap;

  &:hover { opacity: 0.7; }
  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: 2px;
  }
`;

const TextBtn = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.highlight};
  cursor: pointer;
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  padding: 0.25rem 0;
  text-align: left;
  transition: opacity 0.2s ease;

  &:hover { opacity: 0.7; }
  &:focus-visible {
    border-radius: 2px;
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: 2px;
  }
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid #e0e0e8;
  margin: 1rem 0;
`;

const PreferenceRow = styled.div`
  align-items: flex-start;
  display: flex;
  gap: 1rem;
  justify-content: space-between;

  & + & { margin-top: 0.75rem; }
`;

const PreferenceName = styled.p`
  color: #0a0a0f;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin: 0 0 0.125rem;
`;

const PreferenceDesc = styled.p`
  color: #5e5e72;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  margin: 0;
`;

const Toggle = styled.button<{ $on: boolean; $disabled?: boolean }>`
  background: ${({ $on, $disabled, theme }) =>
    $disabled ? theme.colors.main : $on ? theme.colors.highlight : theme.colors.main};
  border: none;
  border-radius: 999px;
  cursor: ${({ $disabled }) => ($disabled ? "not-allowed" : "pointer")};
  flex-shrink: 0;
  height: 1.25rem;
  position: relative;
  transition: background 0.2s ease;
  width: 2.25rem;

  &::after {
    background: white;
    border-radius: 50%;
    content: "";
    height: 0.875rem;
    left: ${({ $on }) => ($on ? "1.125rem" : "3px")};
    position: absolute;
    top: 3px;
    transition: left 0.2s ease;
    width: 0.875rem;
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
