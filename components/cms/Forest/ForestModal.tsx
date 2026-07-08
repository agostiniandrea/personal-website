import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/router";
import styled, { keyframes } from "styled-components";
import { BREAKPOINTS } from "@constants";

const copy = {
  en: {
    ariaLabel: "Share feedback",
    close: "✕",
    closeAriaLabel: "Close",
    s1Title: "Help this portfolio grow.",
    s1Body: "I’d genuinely love to hear your thoughts. Every meaningful suggestion helps improve this project — and as a thank you, I dedicate a real tree.",
    s2Title: "What type of feedback?",
    s2CatAriaLabel: "Feedback category",
    s3Title: "What would you improve?",
    s3Placeholder: "Tell me anything.\n\nBe honest.",
    s3FieldAriaLabel: "Your feedback",
    s4Title: "Almost there.",
    optional: "Optional",
    namePlaceholder: "Name",
    nameAriaLabel: "Your name",
    emailPlaceholder: "Email",
    emailAriaLabel: "Your email",
    linkedinPlaceholder: "LinkedIn",
    linkedinAriaLabel: "LinkedIn URL",
    githubPlaceholder: "GitHub",
    githubAriaLabel: "GitHub URL",
    websitePlaceholder: "Website",
    websiteAriaLabel: "Website URL",
    publicAck: "I’m happy for my feedback to be publicly acknowledged.",
    errorMsg: "Something went wrong. Try again or email me directly at a.agostini92@gmail.com",
    sending: "Sending…",
    send: "🌱 Send",
    continue: "Continue →",
    back: "← Back",
    s5Title: "Thank you.",
    s5Body: "Your leaf has been received. I’ll personally read every submission.",
    s5Close: "Close",
  },
  it: {
    ariaLabel: "Invia feedback",
    close: "✕",
    closeAriaLabel: "Chiudi",
    s1Title: "Aiuta questo portfolio a crescere.",
    s1Body: "Mi farebbe davvero piacere conoscere il tuo punto di vista. Ogni suggerimento significativo migliora il progetto — e come ringraziamento, dedico un albero vero.",
    s2Title: "Che tipo di feedback?",
    s2CatAriaLabel: "Categoria del feedback",
    s3Title: "Cosa miglioreresti?",
    s3Placeholder: "Dimmi tutto.\n\nSii onesto.",
    s3FieldAriaLabel: "Il tuo feedback",
    s4Title: "Quasi fatto.",
    optional: "Facoltativo",
    namePlaceholder: "Nome",
    nameAriaLabel: "Il tuo nome",
    emailPlaceholder: "Email",
    emailAriaLabel: "La tua email",
    linkedinPlaceholder: "LinkedIn",
    linkedinAriaLabel: "URL LinkedIn",
    githubPlaceholder: "GitHub",
    githubAriaLabel: "URL GitHub",
    websitePlaceholder: "Sito web",
    websiteAriaLabel: "URL sito web",
    publicAck: "Accetto che il mio feedback venga riconosciuto pubblicamente.",
    errorMsg: "Qualcosa è andato storto. Riprova oppure scrivimi a a.agostini92@gmail.com",
    sending: "Invio in corso…",
    send: "🌱 Invia",
    continue: "Continua →",
    back: "← Indietro",
    s5Title: "Grazie.",
    s5Body: "La tua foglia è stata ricevuta. Leggerò personalmente ogni messaggio.",
    s5Close: "Chiudi",
  },
};

type Step = 1 | 2 | 3 | 4 | 5;

type FeedbackCategory =
  | "UX"
  | "Accessibility"
  | "Performance"
  | "Design"
  | "Content"
  | "Bug"
  | "General thoughts";

interface FeedbackData {
  category: FeedbackCategory | "";
  message: string;
  name: string;
  email: string;
  linkedin: string;
  github: string;
  website: string;
  publicAcknowledgment: boolean;
  _hp: string; // honeypot — must stay empty
}

export interface ForestModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: FeedbackCategory[] = [
  "UX",
  "Accessibility",
  "Performance",
  "Design",
  "Content",
  "Bug",
  "General thoughts",
];

const EMPTY: FeedbackData = {
  category: "",
  message: "",
  name: "",
  email: "",
  linkedin: "",
  github: "",
  website: "",
  publicAcknowledgment: false,
  _hp: "",
};

/* ── Animations ── */

const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
`;

const leafFall = keyframes`
  0%   { opacity: 1; transform: translateY(-10px) rotate(0deg) translateX(0); }
  100% { opacity: 0; transform: translateY(110px) rotate(55deg) translateX(var(--drift, 0px)); }
`;

/* ── Layout ── */

const Backdrop = styled.div`
  -webkit-backdrop-filter: blur(5px);
  align-items: center;
  animation: ${fadeIn} 0.2s ease;
  backdrop-filter: blur(5px);
  background: rgba(0, 0, 0, 0.55);
  display: flex;
  inset: 0;
  justify-content: center;
  padding: 1rem;
  position: fixed;
  z-index: 1000;
`;

const Card = styled.div`
  animation: ${slideUp} 0.25s ease;
  background: ${({ theme }) => theme.colors.background};
  border: 1px solid rgba(128, 128, 128, 0.15);
  border-radius: 1.25rem;
  max-height: 92vh;
  max-width: 520px;
  overflow-y: auto;
  padding: 2.5rem 2rem;
  position: relative;
  width: 100%;

  @media (min-width: ${BREAKPOINTS.mobile}) {
    padding: 3rem;
  }
`;

const CloseBtn = styled.button`
  align-self: center;
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.paragraph};
  cursor: pointer;
  flex-shrink: 0;
  font-size: 1.125rem;
  line-height: 1;
  padding: 0.25rem;
  transition: color 0.15s ease;

  &:hover { color: ${({ theme }) => theme.colors.headline}; }

  &:focus-visible {
    border-radius: 4px;
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: 3px;
  }
`;

/* ── Step indicator ── */

const ModalHeader = styled.div`
  align-items: center;
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
`;

const Dots = styled.div`
  display: flex;
  flex: 1;
  gap: 0.375rem;
`;

const Dot = styled.span<{ $on: boolean }>`
  background: ${({ theme, $on }) => ($on ? theme.colors.highlight : "rgba(128,128,128,0.18)")};
  border-radius: 999px;
  flex: 1;
  height: 3px;
  transition: background 0.3s ease;
`;

/* ── Step content wrapper ── */

const StepWrap = styled.div`
  animation: ${slideUp} 0.2s ease;
`;

/* ── Typography ── */

const Icon = styled.div`
  font-size: 2.5rem;
  line-height: 1;
  margin-bottom: 1.25rem;
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.headline};
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  line-height: ${({ theme }) => theme.lineHeights.tight};
  margin: 0 0 0.75rem;

  @media (min-width: ${BREAKPOINTS.mobile}) {
    font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  }
`;

const Body = styled.p`
  color: ${({ theme }) => theme.colors.paragraph};
  font-size: ${({ theme }) => theme.fontSizes.md};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  margin: 0 0 2rem;
`;

/* ── Step 2: Categories ── */

const CatGrid = styled.div`
  display: grid;
  gap: 0.5rem;
  grid-template-columns: 1fr 1fr;
  margin-bottom: 2rem;
`;

const CatBtn = styled.button<{ $selected: boolean }>`
  background: ${({ theme, $selected }) =>
    $selected ? theme.colors.surface : "transparent"};
  border: 1.5px solid
    ${({ theme, $selected }) =>
      $selected ? theme.colors.highlight : "rgba(128,128,128,0.2)"};
  border-radius: 0.625rem;
  color: ${({ theme, $selected }) =>
    $selected ? theme.colors.highlight : theme.colors.paragraph};
  cursor: pointer;
  font-family: ${({ theme }) => theme.fontFamilies.default};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  padding: 0.625rem 0.875rem;
  text-align: left;
  transition: all 0.15s ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.highlight};
    color: ${({ theme }) => theme.colors.headline};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: 2px;
  }
`;

/* ── Step 3: Textarea ── */

const Textarea = styled.textarea`
  background: transparent;
  border: 1.5px solid rgba(128, 128, 128, 0.2);
  border-radius: 0.75rem;
  box-sizing: border-box;
  color: ${({ theme }) => theme.colors.headline};
  font-family: ${({ theme }) => theme.fontFamilies.default};
  font-size: ${({ theme }) => theme.fontSizes.md};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  margin-bottom: 2rem;
  min-height: 160px;
  padding: 1rem;
  resize: vertical;
  transition: border-color 0.15s ease;
  width: 100%;

  &::placeholder {
    color: ${({ theme }) => theme.colors.paragraph};
    opacity: 0.55;
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.highlight};
    outline: none;
  }
`;

/* ── Step 4: Optional fields ── */

const OptionalLabel = styled.p`
  color: ${({ theme }) => theme.colors.paragraph};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.12em;
  margin: 0 0 0.875rem;
  text-transform: uppercase;
`;

const InputList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const Input = styled.input`
  background: transparent;
  border: 1.5px solid rgba(128, 128, 128, 0.2);
  border-radius: 0.625rem;
  box-sizing: border-box;
  color: ${({ theme }) => theme.colors.headline};
  font-family: ${({ theme }) => theme.fontFamilies.default};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  padding: 0.75rem 1rem;
  transition: border-color 0.15s ease;
  width: 100%;

  &::placeholder {
    color: ${({ theme }) => theme.colors.paragraph};
    opacity: 0.55;
  }

  &:focus {
    border-color: ${({ theme }) => theme.colors.highlight};
    outline: none;
  }
`;

const CheckboxRow = styled.label`
  align-items: flex-start;
  cursor: pointer;
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;

  input[type="checkbox"] {
    accent-color: ${({ theme }) => theme.colors.highlight};
    cursor: pointer;
    flex-shrink: 0;
    height: 1rem;
    margin-top: 0.1875rem;
    width: 1rem;
  }
`;

const CheckboxText = styled.span`
  color: ${({ theme }) => theme.colors.paragraph};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
`;

const ErrorMsg = styled.p`
  color: #ef4444;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  margin: 0 0 1rem;
`;

/* ── Buttons ── */

const BtnRow = styled.div`
  align-items: center;
  display: flex;
  gap: 1.25rem;
`;

const BackBtn = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.paragraph};
  cursor: pointer;
  font-family: ${({ theme }) => theme.fontFamilies.default};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  padding: 0;
  transition: color 0.15s ease;

  &:hover { color: ${({ theme }) => theme.colors.headline}; }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.highlight};
    outline-offset: 3px;
  }
`;

const PrimaryBtn = styled.button`
  align-items: center;
  background: ${({ theme }) => theme.colors.button};
  border: 2px solid transparent;
  border-radius: ${({ theme }) => theme.radii.xs};
  color: ${({ theme }) => theme.colors.button_text};
  cursor: pointer;
  display: inline-flex;
  font-family: ${({ theme }) => theme.fontFamilies.default};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  transition: all 0.2s ease;

  &:hover {
    background: transparent;
    border-color: ${({ theme }) => theme.colors.highlight};
    color: ${({ theme }) => theme.colors.highlight};
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
    pointer-events: none;
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.headline};
    outline-offset: 3px;
  }
`;

/* ── Step 5: Success ── */

const SuccessWrap = styled.div`
  animation: ${slideUp} 0.3s ease;
  padding: 1rem 0;
  text-align: center;
`;

const Leaves = styled.div`
  height: 90px;
  margin-bottom: 1.5rem;
  position: relative;
`;

const Leaf = styled.span<{ $delay: number; $drift: string }>`
  font-size: 1.5rem;
  left: 50%;
  position: absolute;
  top: 0;
  --drift: ${({ $drift }) => $drift};
  animation: ${leafFall} 1.3s ease-out ${({ $delay }) => $delay}s both;
`;

const SuccessTitle = styled.h2`
  color: ${({ theme }) => theme.colors.headline};
  font-family: ${({ theme }) => theme.fontFamilies.heading};
  font-size: ${({ theme }) => theme.fontSizes["2xl"]};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin: 0 0 0.75rem;
`;

const SuccessBody = styled.p`
  color: ${({ theme }) => theme.colors.paragraph};
  font-size: ${({ theme }) => theme.fontSizes.md};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  margin: 0 auto 2rem;
  max-width: 34ch;
`;

/* ── Component ── */

const LEAVES = [
  { delay: 0, drift: "20px" },
  { delay: 0.18, drift: "-28px" },
  { delay: 0.34, drift: "10px" },
  { delay: 0.5, drift: "-18px" },
  { delay: 0.65, drift: "36px" },
];

export const ForestModal: React.FC<ForestModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<Step>(1);
  const [data, setData] = useState<FeedbackData>(EMPTY);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const firstFocusRef = useRef<HTMLButtonElement>(null);
  const { locale } = useRouter();
  const t = locale === "it" ? copy.it : copy.en;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setData(EMPTY);
      setError(null);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Auto-focus first interactive element when step changes
  useEffect(() => {
    if (isOpen) firstFocusRef.current?.focus();
  }, [step, isOpen]);

  const next = useCallback(() => setStep((s) => (Math.min(s + 1, 5) as Step)), []);
  const back = useCallback(() => { setError(null); setStep((s) => (Math.max(s - 1, 1) as Step)); }, []);

  const submit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      setStep(5);
    } catch {
      setError("Something went wrong. Try again or email me directly at a.agostini92@gmail.com");
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted || !isOpen) return null;

  const modal = (
    <Backdrop
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      role="dialog"
      aria-modal="true"
      aria-label={t.ariaLabel}
    >
      <Card>
        <ModalHeader>
          {step < 5 ? (
            <Dots aria-hidden="true">
              {([1, 2, 3, 4] as const).map((s) => (
                <Dot key={s} $on={s <= step} />
              ))}
            </Dots>
          ) : (
            <div style={{ flex: 1 }} />
          )}
          <CloseBtn onClick={onClose} aria-label={t.closeAriaLabel}>{t.close}</CloseBtn>
        </ModalHeader>

        {step === 1 && (
          <StepWrap key="s1">
            <Icon aria-hidden="true">🌳</Icon>
            <Title>{t.s1Title}</Title>
            <Body>{t.s1Body}</Body>
            <PrimaryBtn ref={firstFocusRef} onClick={next} type="button">
              {t.continue}
            </PrimaryBtn>
          </StepWrap>
        )}

        {step === 2 && (
          <StepWrap key="s2">
            <Title>{t.s2Title}</Title>
            <CatGrid role="group" aria-label={t.s2CatAriaLabel}>
              {CATEGORIES.map((cat) => (
                <CatBtn
                  key={cat}
                  $selected={data.category === cat}
                  onClick={() => setData((d) => ({ ...d, category: cat }))}
                  type="button"
                  aria-pressed={data.category === cat}
                >
                  {cat}
                </CatBtn>
              ))}
            </CatGrid>
            <BtnRow>
              <BackBtn onClick={back} type="button">{t.back}</BackBtn>
              <PrimaryBtn
                ref={firstFocusRef}
                onClick={next}
                disabled={!data.category}
                type="button"
              >
                {t.continue}
              </PrimaryBtn>
            </BtnRow>
          </StepWrap>
        )}

        {step === 3 && (
          <StepWrap key="s3">
            <Title>{t.s3Title}</Title>
            <Textarea
              placeholder={t.s3Placeholder}
              value={data.message}
              onChange={(e) => setData((d) => ({ ...d, message: e.target.value }))}
              aria-label={t.s3FieldAriaLabel}
              autoFocus
            />
            <BtnRow>
              <BackBtn onClick={back} type="button">{t.back}</BackBtn>
              <PrimaryBtn
                onClick={next}
                disabled={data.message.trim().length < 10}
                type="button"
              >
                {t.continue}
              </PrimaryBtn>
            </BtnRow>
          </StepWrap>
        )}

        {step === 4 && (
          <StepWrap key="s4">
            <Title>{t.s4Title}</Title>
            <OptionalLabel>{t.optional}</OptionalLabel>
            <InputList>
              <Input
                placeholder={t.namePlaceholder}
                value={data.name}
                onChange={(e) => setData((d) => ({ ...d, name: e.target.value }))}
                aria-label={t.nameAriaLabel}
              />
              <Input
                placeholder={t.emailPlaceholder}
                type="email"
                value={data.email}
                onChange={(e) => setData((d) => ({ ...d, email: e.target.value }))}
                aria-label={t.emailAriaLabel}
              />
              <Input
                placeholder={t.linkedinPlaceholder}
                value={data.linkedin}
                onChange={(e) => setData((d) => ({ ...d, linkedin: e.target.value }))}
                aria-label={t.linkedinAriaLabel}
              />
              <Input
                placeholder={t.githubPlaceholder}
                value={data.github}
                onChange={(e) => setData((d) => ({ ...d, github: e.target.value }))}
                aria-label={t.githubAriaLabel}
              />
              <Input
                placeholder={t.websitePlaceholder}
                value={data.website}
                onChange={(e) => setData((d) => ({ ...d, website: e.target.value }))}
                aria-label={t.websiteAriaLabel}
              />
            </InputList>
            {/* Honeypot — hidden from real users, bots fill it */}
            <input
              type="text"
              name="_hp"
              value={data._hp}
              onChange={(e) => setData((d) => ({ ...d, _hp: e.target.value }))}
              tabIndex={-1}
              aria-hidden="true"
              style={{ position: "absolute", left: "-9999px", width: "1px", height: "1px", opacity: 0 }}
            />
            <CheckboxRow>
              <input
                type="checkbox"
                checked={data.publicAcknowledgment}
                onChange={(e) =>
                  setData((d) => ({ ...d, publicAcknowledgment: e.target.checked }))
                }
                id="public-ack"
              />
              <CheckboxText>{t.publicAck}</CheckboxText>
            </CheckboxRow>
            {error && <ErrorMsg role="alert">{t.errorMsg}</ErrorMsg>}
            <BtnRow>
              <BackBtn onClick={back} type="button">{t.back}</BackBtn>
              <PrimaryBtn
                onClick={submit}
                disabled={submitting}
                type="button"
              >
                {submitting ? t.sending : t.send}
              </PrimaryBtn>
            </BtnRow>
          </StepWrap>
        )}

        {step === 5 && (
          <SuccessWrap key="s5">
            <Leaves aria-hidden="true">
              {LEAVES.map(({ delay, drift }, i) => (
                <Leaf key={i} $delay={delay} $drift={drift}>🍃</Leaf>
              ))}
            </Leaves>
            <SuccessTitle>{t.s5Title}</SuccessTitle>
            <SuccessBody>{t.s5Body}</SuccessBody>
            <PrimaryBtn onClick={onClose} type="button">
              {t.s5Close}
            </PrimaryBtn>
          </SuccessWrap>
        )}
      </Card>
    </Backdrop>
  );

  return createPortal(modal, document.body);
};

export default ForestModal;
