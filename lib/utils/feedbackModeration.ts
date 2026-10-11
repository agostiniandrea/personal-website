/* ---------------------------------------------------------------------------
 * Feedback content moderation
 *
 * A small, dependency-free abuse filter for the public feedback form, run on
 * the server (pages/api/feedback.ts) because the client cannot be trusted.
 * English and Italian only.
 *
 * It answers one question per submission and returns one of three verdicts:
 *
 *   block  The submission is clearly abusive and is refused (HTTP 400). Nothing
 *          is stored. Reserved for slurs, credible threats, clearly abusive
 *          sexual content, insults aimed at the person reading ("you
 *          idiot", "fuck you") and link spam.
 *   flag   Mild or strong profanity that is not aimed at a person: "this is
 *          f***ing slow" and "the contrast is shit" are real feedback. The submission is accepted EXACTLY as
 *          before, so it is stored as `pending` like every other one, is not
 *          approved and is not rewarded. The verdict only exists so the caller
 *          can note it; this module never touches status, trees or counters.
 *   allow  Nothing to report.
 *
 * Design rules:
 *  - Whole tokens only. Matching never looks inside a word, so "class",
 *    "assess", "cockpit", "Scunthorpe", "Dickens" or the surname "Cazzola"
 *    cannot trigger anything.
 *  - Obfuscation is undone before matching (see `normalizeForModeration` and
 *    the views below), but only in ways that cannot turn ordinary text into a
 *    match: digits are decoded only inside tokens that also contain letters,
 *    masks (f*ck) need at least two literal letters, and spaced-out letters
 *    (f u c k) need a run of three or more.
 *  - Harsh is not abusive. Criticism of the work ("looks like AI slop", "this
 *    is garbage", "the nav is shit") is feedback. What is refused is an insult
 *    aimed at the person: a profane person-noun next to "you"/"u", or a fixed
 *    insult such as "fuck you". Self-reference and negation ("I felt like an
 *    idiot", "you are not an idiot") are left alone.
 *    The same line is drawn for hostility without a swear word: "you suck" and
 *    "I hate you" are blocked (they judge the author and say nothing about the
 *    page), while "this navigation sucks" and "I hate this navigation" are
 *    feedback and pass. See `directedHostility`.
 *  - Threats and sexual abuse are phrase patterns, never single words. A bare
 *    "kill" proves nothing; "I will kill you" does, and "this will kill your
 *    SEO" does not.
 *  - Ambiguous words are left out of the block list on purpose ("chink" in
 *    "a chink in the armour", "dyke", "coon" as in Maine Coon, "finocchio" as
 *    in fennel, "negro" as the Spanish word for black). A short, precise list
 *    that never blocks a real visitor beats a long one that does.
 *  - Nothing here echoes or logs the text. The result carries a reason code and
 *    nothing else, so a caller has no way to leak the content by accident.
 *
 * The lists are data, kept at the top of the file so they can be reviewed and
 * extended without touching the matching code. Add a word by adding an
 * alternative to the right group, then add a test beside it.
 * ------------------------------------------------------------------------- */

export type BlockReason =
  "slur" | "threat" | "sexual_abuse" | "directed_abuse" | "link_spam";

export type FlagReason = "profanity" | "ambiguous_term";

export type ModerationVerdict =
  | { action: "allow" }
  | { action: "flag"; reasons: FlagReason[] }
  | { action: "block"; reason: BlockReason };

export interface ModerationInput {
  message?: unknown;
  name?: unknown;
}

/* Link rules. A feedback message may legitimately point at a page or a
   screenshot, so a few links are fine; what is refused is a link dump. */

/** More links than this in one message is spam. */
export const MAX_LINKS_IN_MESSAGE = 3;
/** Two or more links with less real text than this around them is spam. */
export const MIN_TEXT_AROUND_LINKS = 20;
/** The same link more than this many times is spam, whatever else is around. */
export const MAX_REPEATS_OF_ONE_LINK = 2;

/* The most text looked at per field. The API caps the message well below this;
   the ceiling only exists so the module is safe to call on anything. */
const PROCESSING_CEILING = 5000;

/* ── Term lists ───────────────────────────────────────────────────────────
   Each entry is a regular-expression alternative matched against a WHOLE
   token (the surrounding ^…$ is added below), so it only ever describes the
   word and its inflections.                                                */

/* Slurs: refused outright. Only terms with no everyday meaning. */
const SLUR_TOKENS = [
  "(?:sand|porch|jungle)?nigg(?:er|ers|a|as|ah|ahs|az)",
  "faggots?",
  "faggy",
  "wetbacks?",
  "towelheads?",
  "ragheads?",
  "gooks?",
  "pakis?",
  "trann(?:y|ies)",
  "jigaboos?",
  "kyke",
  // Italian
  "froc(?:io|ia|ie|i)",
  "ricchion(?:e|i|a)",
  "culatton(?:e|i)",
];

/* A slur that is also a real first name, so it is not applied to `name`. */
const SLUR_TOKENS_NOT_FOR_NAMES = ["kik(?:e|es)"];

/* Profanity: flagged, never blocked. */
const PROFANITY_TOKENS = [
  "(?:mother|dumb|fat|clown)?fuck(?:s|ed|er|ers|ing|in|face|faces|head|heads|wit|wits|tard|tards|up|ups|off)?",
  "fck|fuk|fuq|fvck|fucc|phuck|phuk",
  "(?:bull|horse|dip|dumb|ape|chicken)?shit(?:s|ty|tier|tiest|ting|ted|head|heads|hole|holes|show|storm|bag)?",
  "crap(?:s|py|pier|piest)?",
  "piss(?:ed|es|ing|y)?",
  "(?:god)?damn(?:ed|it|ing)?",
  "(?:dumb|fat|smart|jack)?ass(?:es|hole|holes|wipe|clown|hat|face)?",
  "arse(?:s|hole|holes)?",
  "bitch(?:es|y|ing|in)?|sonofabitch",
  "bastards?",
  "cunts?",
  "wank(?:er|ers|ed|ing|s)?|twats?|tossers?|bollocks|bellends?|knobheads?",
  "buggers?",
  "sluts?|slutty|whores?|skanks?",
  "douche(?:bag|bags|y|s)?",
  "jerkoffs?|jackoffs?",
  "cocksuckers?",
  // Italian
  "(?:in)?cazz(?:o|i|ata|ate|one|oni|aro|ari|ista|uto)",
  "incazzat[oaie]|incazzare|testadicazzo|rompicoglioni",
  "vaffanculo|vafanculo|affanculo|fanculo|vaffancul|vaffa",
  "stronz(?:o|a|i|e|ata|ate|accio|ona|one)",
  "merd(?:a|e|accia|oso|osa|osi|ata|ate)",
  "minchia(?:te)?",
  "coglion(?:e|i|a|ata|ate|accio|aggine)",
  "puttan(?:a|e|ata|ate|iere|accia)",
  "zoccol(?:a|e)",
  "fig(?:a|he)",
  "cul(?:o|i)",
  "bastard(?:o|a|i|e)",
  "fott(?:iti|ere|uto|uta|uti|ute|i|etevi)",
  "mignott(?:a|e)",
];

/* Profanity that is also somebody's name or surname: still flagged in the
   message, never in `name` (a visitor called Dick or Troia is not a problem). */
const PROFANITY_TOKENS_NOT_FOR_NAMES = [
  "dicks?|dickheads?|dickwads?",
  "cocks?",
  "pricks?",
  "fanny",
  "troi(?:a|e|ata|ate)",
];

/* Words with a legitimate meaning of their own ("retard" is an engine and
   electronics term, "fag" is a British cigarette). Flagged in a message so a
   human decides, ignored in a name. */
const AMBIGUOUS_TOKENS = ["retard(?:s|ed)?", "fags?"];

/* Nouns that name a person and insult them. On their own they are profanity
   (flagged); next to a second-person word they are an insult at the reader
   (blocked). "fuck" and "shit" are NOT here: they describe things as often as
   people ("what the fuck is this nav"). */
const PERSON_INSULT_TOKENS = [
  "dumb(?:fuck|ass|shit)(?:s|es)?",
  "(?:jack|smart|fat)ass(?:es)?",
  "(?:ass|arse)holes?",
  "dickheads?|douchebags?|shitheads?|shitbags?|scumbags?",
  "motherfuckers?",
  "fuck(?:er|ers|face|faces|head|heads|tard|tards|wit|wits)",
  "cunts?|twats?|pricks?|tossers?|wankers?",
  "bitch(?:es)?|bastards?",
  "morons?|idiots?|imbeciles?|cretins?|retards?",
];

/* Words that are most often masked ("f*ck", "n*gger"). Compared position by
   position against a token that contains `*` or `#`. */
const MASKABLE_SLURS = ["nigger", "nigga", "faggot"];
const MASKABLE_PROFANITY = [
  "fuck",
  "fucker",
  "fucking",
  "motherfucker",
  "shit",
  "shitty",
  "bitch",
  "cunt",
  "bastard",
  "asshole",
  "whore",
  "slut",
  "cazzo",
  "merda",
  "stronzo",
  "puttana",
  "coglione",
];

/* ── Phrase patterns ──────────────────────────────────────────────────────
   Matched against the text with punctuation turned into single spaces and
   apostrophes removed ("I'll" → "ill", "don't" → "dont").                  */

const EN_INTENT = String.raw`(?:(?:i|we)\s+(?:will|shall|wanna|want\s+to|am\s+going\s+to|am\s+gonna|am\s+about\s+to|gonna|going\s+to)|ill|well|ima|im\s+(?:going\s+to|gonna|about\s+to))(?:\s+(?:definitely|really|totally|actually|just|literally|personally|fucking))*`;

const EN_TARGET = String.raw`(?:you|u|ya|your\s+(?:family|mom|mum|mother|dad|father|wife|husband|kids|children))`;

/* "I'll shoot you an email" is not a threat; only the verb that has an idiom
   needs the extra look-ahead. */
const EN_NOT_AN_IDIOM = String.raw`(?!\s+(?:an?|over|the|some|my|your|off|through|across|this|that|it|them|him|her|our|one|two|three|\d))`;

const THREAT_PATTERNS = [
  // "I will kill you", "I'm going to hurt your family"
  String.raw`\b${EN_INTENT}\s+(?:(?:kill|murder|stab|strangle|behead|rape|torture|hurt)\s+${EN_TARGET}|shoot\s+${EN_TARGET}${EN_NOT_AN_IDIOM})\b`,
  // "I will find you and …"
  String.raw`\b${EN_INTENT}\s+find\s+(?:you|u)\s+and\b`,
  // "kill yourself", but not "don't kill yourself over it"
  String.raw`(?<!\b(?:dont|not|never)\s)\b(?:go\s+(?:and\s+)?)?(?:kill|hang|shoot|drown|neck)\s+(?:your\s*self|urself|ur\s*self|yourselves)\b`,
  String.raw`\bkys\b`,
  String.raw`\bgo\s+(?:and\s+)?die\b`,
  String.raw`\b(?:you|u)\s+(?:should|ought\s+to|need\s+to|better|deserve\s+to)\s+(?:just\s+)?(?:die|be\s+(?:killed|shot|raped))\b`,
  String.raw`\bi\s+hope\s+(?:you|u|your\s+family)\s+(?:die|dies|get\s+(?:cancer|killed|raped|shot)|burn|rot)\b`,
  String.raw`\bi\s+know\s+where\s+(?:you|u|your\s+(?:family|kids))\s+(?:live|lives|work|works|sleep|sleeps)\b`,
  // Italian
  String.raw`\bt(?:i\s+)?(?:ammazzo|ammazzero|uccido|uccidero|scanno|scannero|sgozzo|sgozzero|stupro|stuprero)\b`,
  String.raw`\bti\s+(?:faccio\s+fuori|taglio\s+la\s+gola|brucio\s+vivo|spacco\s+(?:la\s+faccia|la\s+testa|il\s+culo)|sparo(?!\s+(?:una?|il|la|le|i|qualche|due|tre|\d)\b))\b`,
  String.raw`\b(?:ammazzati|uccidi\s*ti|suicidati|impiccati)\b`,
  String.raw`\bvai\s+a\s+morire\b`,
  String.raw`\bti\s+auguro\s+(?:la\s+morte|di\s+morire)\b`,
  String.raw`\bspero\s+che\s+(?:tu\s+)?(?:muoia|muori|crepi)\b`,
  String.raw`\bso\s+dove\s+(?:abiti|vivi|lavori|dormi)\b`,
  String.raw`\bti\s+trovo\s+e\s+ti\b`,
];

const SEXUAL_ABUSE_PATTERNS = [
  String.raw`\b(?:suck|lick|eat|kiss)\s+(?:my|his|her)\s+(?:dick|cock|balls|ass|arse|pussy|cunt|tits|boobs|nipples|cum)\b`,
  String.raw`\b(?:send|show|give|share)\s+(?:me\s+)?(?:your\s+|ur\s+|some\s+)?(?:nudes?|nude\s+(?:pics?|photos?|pictures?)|naked\s+(?:pics?|photos?|pictures?)|tits|boobs|pussy|dick\s+pics?|cock\s+pics?)\b`,
  String.raw`\b${EN_INTENT}\s+(?:fuck|rape|sodomize|bang)\s+(?:you|u|your\s+(?:mom|mum|mother|sister|wife|daughter|ass))\b`,
  String.raw`\b(?:fuck|rape)\s+your\s+(?:mom|mum|mother|sister|wife|daughter)\b`,
  String.raw`\bcum\s+(?:in|on|all\s+over)\s+(?:you|your|ur)\b`,
  String.raw`\bsit\s+on\s+my\s+(?:face|dick|cock)\b`,
  String.raw`\bfuck\s+(?:me|you|u)\s+(?:hard|now|tonight|senseless)\b`,
  String.raw`\b(?:child|underage|minor|preteen)\s+(?:porn|porno|pornography)\b`,
  // Italian
  String.raw`\b(?:succhiami|leccami|succhia|lecca)\s+(?:il\s+|la\s+|le\s+|i\s+)?(?:cazzo|uccello|figa|tette|culo|palle|capezzoli)\b`,
  String.raw`\b(?:ti\s+(?:scopo|inculo)|ti\s+voglio\s+(?:scopare|inculare)|voglio\s+scoparti|scopami|fammi\s+un\s+pompino)\b`,
  String.raw`\bfammi\s+vedere\s+(?:le\s+tette|la\s+figa|il\s+culo|il\s+cazzo|nuda|nudo)\b`,
  String.raw`\bmandami\s+(?:le\s+tue\s+)?(?:foto\s+)?(?:nud[ae]|tette|della\s+figa)\b`,
];

/* Profanity that only shows as a phrase: the Italian blasphemies. Flag only. */
/* Fixed insults aimed at the reader. A pronoun is part of the pattern or the
   phrase can only be aimed at a person ("vaffanculo", "testa di cazzo"). */
const DIRECTED_ABUSE_PATTERNS = [
  String.raw`\bfuck\s+(?:you|u|yourself|urself|off)\b`,
  String.raw`\bgo\s+(?:and\s+)?(?:fuck|screw)\s+(?:yourself|urself)\b`,
  String.raw`\b(?:you|u|youre|ur)\s+(?:are\s+|re\s+|r\s+)?(?:(?:a|an|such|just|absolute|complete|total|utter|fucking|real)\s+)*piece\s+of\s+(?:shit|crap|garbage|trash)\b`,
  // Italian
  String.raw`\b(?:vaffanculo|vafanculo|affanculo|fanculo|vaffancul|fottiti|testa\s+di\s+(?:cazzo|merda)|pezzo\s+di\s+(?:merda|stronzo)|figlio\s+di\s+puttana|vai\s+a\s+(?:cagare|fanculo))\b`,
  String.raw`\b(?:tu\s+)?(?:sei|siete)\s+(?:(?:un|una|proprio\s+un|solo\s+un|davvero\s+un)\s+)?(?:coglione|coglioni|stronzo|stronza|stronzi|idiota|idioti|imbecille|imbecilli|cretino|cretini|deficiente|deficienti|bastardo|bastardi)\b`,
];

const PROFANITY_PHRASE_PATTERNS = [
  String.raw`\b(?:porco|porca)\s+(?:dio|madonna|puttana|troia)\b`,
  String.raw`\bdio\s+(?:cane|porco|bestia|maiale|merda)\b`,
  String.raw`\bmadonna\s+(?:puttana|troia|porca|cagna)\b`,
];

const anchored = (parts: string[]) => new RegExp(`^(?:${parts.join("|")})$`);
const anyOf = (patterns: string[]) => patterns.map((p) => new RegExp(p));

const SLUR_RE = anchored(SLUR_TOKENS);
const SLUR_NOT_FOR_NAMES_RE = anchored(SLUR_TOKENS_NOT_FOR_NAMES);
const PROFANITY_RE = anchored(PROFANITY_TOKENS);
const PROFANITY_NOT_FOR_NAMES_RE = anchored(PROFANITY_TOKENS_NOT_FOR_NAMES);
const AMBIGUOUS_RE = anchored(AMBIGUOUS_TOKENS);
const THREAT_RES = anyOf(THREAT_PATTERNS);
const SEXUAL_ABUSE_RES = anyOf(SEXUAL_ABUSE_PATTERNS);
const PROFANITY_PHRASE_RES = anyOf(PROFANITY_PHRASE_PATTERNS);
const DIRECTED_ABUSE_RES = anyOf(DIRECTED_ABUSE_PATTERNS);
const PERSON_INSULT_RE = anchored(PERSON_INSULT_TOKENS);

/* Words that make a person-noun an insult at the reader... */
const SECOND_PERSON = new Set(["you", "u", "ur", "youre", "ya", "yall"]);
/* Denials: "you are not an idiot", "I don't think you suck". */
const NEGATIONS = [
  "not",
  "dont",
  "doesnt",
  "didnt",
  "never",
  "arent",
  "isnt",
  "wasnt",
  "cant",
  "wont",
  "wouldnt",
  "shouldnt",
  "couldnt",
];
/* ...unless the speaker is talking about themselves or denying it. */
const SELF_OR_NEGATION = new Set([
  "i",
  "im",
  "me",
  "my",
  "myself",
  "we",
  ...NEGATIONS,
]);
/* How many words may sit between the pronoun and the noun ("you are such a
   ..."), and how far after the noun a pronoun still counts ("... asshole, you"). */
const INSULT_WINDOW_BEFORE = 5;
const INSULT_WINDOW_AFTER = 2;

/* ── Normalisation ───────────────────────────────────────────────────── */

/* Letters from other scripts (and Latin letters NFD cannot split) that are
   used in place of a Latin one. Deliberately short: only lookalikes that
   survive NFKC and are common in evasion. Written as escapes, not as the
   characters themselves, because a Cyrillic letter is indistinguishable from its
   Latin twin on screen and a reviewer could not tell what they were reading. */
const CONFUSABLES = new Map<string, string>([
  // Cyrillic lookalikes of: a e o p c y x i j s h k m h t
  ["\u0430", "a"],
  ["\u0435", "e"],
  ["\u043E", "o"],
  ["\u0440", "p"],
  ["\u0441", "c"],
  ["\u0443", "y"],
  ["\u0445", "x"],
  ["\u0456", "i"],
  ["\u0458", "j"],
  ["\u0455", "s"],
  ["\u04BB", "h"],
  ["\u043A", "k"],
  ["\u043C", "m"],
  ["\u043D", "h"],
  ["\u0442", "t"],
  // Greek lookalikes of: a e i k v o p t u x
  ["\u03B1", "a"],
  ["\u03B5", "e"],
  ["\u03B9", "i"],
  ["\u03BA", "k"],
  ["\u03BD", "v"],
  ["\u03BF", "o"],
  ["\u03C1", "p"],
  ["\u03C4", "t"],
  ["\u03C5", "u"],
  ["\u03C7", "x"],
  // Latin letters with no decomposition: dotless i, sharp s, o-slash, d-bar, l-bar, ae, oe
  ["\u0131", "i"],
  ["\u00DF", "ss"],
  ["\u00F8", "o"],
  ["\u0111", "d"],
  ["\u0142", "l"],
  ["\u00E6", "ae"],
  ["\u0153", "oe"],
]);
const CONFUSABLES_RE = new RegExp(`[${[...CONFUSABLES.keys()].join("")}]`, "g");

/**
 * Reduces text to plain lowercase ASCII-ish letters, digits and punctuation so
 * the rest of the module compares like with like:
 *
 *  - NFKC folds full-width and mathematical-alphabet letters to ordinary ones;
 *  - control characters and every kind of whitespace become one space;
 *  - zero-width, bidirectional, soft-hyphen and filler characters are removed, so a
 *    word cannot be split by something the reader cannot see;
 *  - accents are removed (an accented u becomes a plain u), then Cyrillic and
 *    Greek lookalikes are mapped to Latin;
 *  - apostrophes are dropped, so "I'll" and "don't" read "ill" and "dont".
 *
 * Exported for the tests; nothing else needs it.
 */
export function normalizeForModeration(raw: string): string {
  return raw
    .slice(0, PROCESSING_CEILING)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\p{Cc}\s]+/gu, " ")
    .replace(/[\p{Cf}\u115F\u1160\u3164\uFFA0]/gu, "")
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(CONFUSABLES_RE, (char) => CONFUSABLES.get(char) ?? char)
    .replace(/['\u2018\u2019\u02BC`]/g, "");
}

/* Digits and symbols people use for letters. "8" and "|" are left out: they
   are too often just a digit or just a bar. */
const LEET: Record<string, string> = {
  "0": "o",
  "1": "i",
  "3": "e",
  "4": "a",
  "5": "s",
  "7": "t",
  "@": "a",
  $: "s",
  "!": "i",
  "+": "t",
};

/* "5h1t" → "shit", "b!tch" → "bitch", "@ss" → "ass". A chunk is decoded only
   when it contains a real letter, so "2026" and "100" are never touched, and a
   trailing "!" or "+" is punctuation, not a letter ("shit!" stays "shit"). The
   rest of the text, punctuation included, is left exactly where it was. */
function decodeLeet(normalized: string): string {
  return normalized.replace(/[a-z0-9@$!+]+/g, (chunk) => {
    const trimmed = chunk.replace(/[!+]+$/, "");
    if (!/[a-z]/.test(trimmed)) return chunk;
    return (
      trimmed.replace(/[0-9@$!+]/g, (c) => LEET[c] ?? "") +
      chunk.slice(trimmed.length)
    );
  });
}

const wordsOf = (text: string): string[] =>
  text.split(/[^a-z0-9]+/).filter(Boolean);

/* "f u c k", "f.u.c.k", "f-u-c-k": three or more single letters, each separated
   from the next, read as one word. A leading single letter is also tried
   without ("i f u c k"), since "i" and "a" are words in their own right. */
function spacedLetterTokens(normalized: string): string[] {
  const runs =
    normalized.match(/(?<![a-z0-9])[a-z](?:[ ._\-*]+[a-z]){2,}(?![a-z0-9])/g) ??
    [];
  return runs.flatMap((run) => {
    const joined = run.replace(/[^a-z]/g, "");
    return [joined, joined.slice(1)];
  });
}

/* "fuuuuck" → "fuck" and "asssss" → "ass": a letter repeated three or more
   times is tried squeezed to one and to two. Two or fewer is left alone, so
   ordinary doubles ("assess", "class") are never rewritten. */
function squeezedVariants(token: string): string[] {
  const once = token.replace(/([a-z])\1{2,}/g, "$1");
  const twice = token.replace(/([a-z])\1{2,}/g, "$1$1");
  return [token, once, twice];
}

function matchesMask(chunk: string, word: string): boolean {
  if (chunk.length !== word.length) return false;
  let literals = 0;
  for (let i = 0; i < word.length; i++) {
    const char = chunk[i];
    if (char === "*" || char === "#") continue;
    if (char !== word[i]) return false;
    literals++;
  }
  return literals >= 2;
}

/* "f*ck", "sh*t", "n*gger": a token with at least one mask character, the
   same length as a known word, and at least two letters in the right place. */
function maskedMatches(normalized: string): {
  slur: boolean;
  profanity: boolean;
} {
  const chunks = (normalized.match(/[a-z*#]+/g) ?? []).filter(
    (chunk) => /[*#]/.test(chunk) && /[a-z]/.test(chunk),
  );
  return {
    slur: chunks.some((chunk) =>
      MASKABLE_SLURS.some((word) => matchesMask(chunk, word)),
    ),
    profanity: chunks.some((chunk) =>
      MASKABLE_PROFANITY.some((word) => matchesMask(chunk, word)),
    ),
  };
}

/* An insult noun with a second-person word within a few words of it, in the
   same sentence: "you dumbfuck", "u are such a dumbass", "idiot, you". A
   first-person word or a negation in between cancels it ("I felt like an
   idiot", "you are not an idiot"). */
function directedInsult(text: string): boolean {
  for (const sentence of text.split(/[.!?;]+/)) {
    const words = wordsOf(sentence);
    for (let at = 0; at < words.length; at++) {
      if (!squeezedVariants(words[at]).some((w) => PERSON_INSULT_RE.test(w))) {
        continue;
      }
      /* "idiot-proof" and "idiot-proofed" describe a design, not the reader. */
      if (words[at + 1]?.startsWith("proof")) continue;
      for (
        let other = Math.max(0, at - INSULT_WINDOW_BEFORE);
        other <= Math.min(words.length - 1, at + INSULT_WINDOW_AFTER);
        other++
      ) {
        if (other === at || !SECOND_PERSON.has(words[other])) continue;
        const [from, to] = other < at ? [other + 1, at] : [at + 1, other];
        const between = words.slice(from, to);
        if (!between.some((w) => SELF_OR_NEGATION.has(w))) return true;
      }
    }
  }
  return false;
}

/* Personal hostility with no profane noun in it: "you suck", "u suck", "I hate
   you". Two fixed shapes, both about the person and neither about the work:
   a second-person pronoun immediately followed by "suck(s)", and "I/we hate"
   immediately followed by a second-person pronoun.

   Why they are blocked: they carry no information about the page. They are a
   verdict on the author, the same thing "you dumbfuck" is without the swear
   word, and a visitor who means them loses nothing by writing what was wrong
   instead. The cost of a wrong block is one edited sentence behind a clear
   message, so the rules are kept strict rather than clever:

   - Adjacency only (a few fillers such as "really" or "guys" may sit in
     between). "this navigation sucks", "I hate this navigation" and "I hate the
     carousel, it kills performance" are about the product and never match.
   - Each clause is judged on its own: a comma, colon, dash, bracket or full
     stop ends it. "I hate you, honestly." is therefore blocked: after the
     comma the sentence is an afterthought, and what stands before it is
     exactly "I hate you". Closing phrases inside the clause ("I hate you so
     much", "I hate you guys") are blocked for the same reason. A pronoun that
     starts a new clause with no punctuation ("I hate you have to scroll") is
     feedback and is left alone.
   - "suck" followed by an object or a particle is the literal verb ("how do
     you suck the colour out of this image", "you suck up the water", "you
     suck on a lemon"), not an insult. "you suck", "you suck at design", "you
     suck, the nav is slow" and "you guys suck" have no object and stay
     blocked. The price of this exception is a run-on such as "you suck this
     is bad" passing unblocked; a missed insult is only a pending message a
     person reviews, a wrongly blocked visitor loses their feedback, so the
     exception errs towards allowing.
   - A denial a few words before cancels it ("I don't think you suck", "I
     don't hate you"). Self-reference does not: "I think you suck" is still
     aimed at the reader.
   - Applies to "suck(s)" and "hate" only. Nothing else is added here. */
const HOSTILE_PRONOUNS = new Set(["you", "u", "ya"]);
const HOSTILE_SUBJECTS = new Set(["i", "we"]);
const HOSTILE_FILLERS = new Set([
  "really",
  "absolutely",
  "fucking",
  "just",
  "totally",
  "truly",
  "completely",
  "so",
  "actually",
  "honestly",
  "literally",
  "seriously",
  "still",
  "do",
  "now",
  "all",
  "both",
  "guys",
]);
const MAX_HOSTILE_FILLERS = 2;
/* A word after "suck" that makes it the literal, transitive verb. */
const LITERAL_SUCK_FOLLOWERS = new Set([
  "the",
  "a",
  "an",
  "this",
  "that",
  "these",
  "those",
  "it",
  "them",
  "my",
  "your",
  "his",
  "her",
  "their",
  "our",
  "some",
  "any",
  "out",
  "up",
  "off",
  "down",
  "in",
  "into",
  "on",
  "dry",
]);
/* A clause ends at sentence punctuation, a comma, a colon, a bracket or a
   spaced dash. */
const HOSTILITY_CLAUSE_END = /[.!?;,:()]+|\s[-\u2013\u2014]+\s/;
const NEGATION_LOOKBACK = 3;
/* The only words that may directly follow "I hate you" (inside the same
   clause) for it to be read as hostility at the reader: a short list of
   ordinary modifiers and addressees ("so much", "very much", "a lot", "more",
   "you guys", "you all", "you lot", "you people", "you too"), not verbs.

   This is a deliberately conservative allow-list, not a grammar. A word that is
   not listed means "no match", so the text passes. That is the safe direction:
   "I hate you have to scroll" (a verb after "you") must stay feedback, and a
   missed insult is only a pending message a person reviews, while a wrong
   block loses a visitor's feedback. The consequence is that an unlisted
   trailing phrase also passes, for example "I hate you with a passion". Lists
   are extended by adding a word here and a test beside it, only when a real
   case shows up. A comma, full stop or other clause end after "you" needs no
   entry: "I hate you, honestly." is blocked by the clause rule, not by this
   list. */
const HATE_TAIL = new Set([
  "so",
  "much",
  "very",
  "more",
  "a",
  "lot",
  "people",
  "all",
  "both",
  "guys",
  "forever",
  "for",
  "because",
  "and",
  "too",
  "now",
  "right",
]);

function negatedBefore(words: string[], at: number): boolean {
  return words
    .slice(Math.max(0, at - NEGATION_LOOKBACK), at)
    .some((w) => NEGATIONS.includes(w));
}

/* Index of the first word after `from` that is not a filler, or -1 when more
   than MAX_HOSTILE_FILLERS fillers are skipped. */
function afterFillers(words: string[], from: number): number {
  let at = from;
  while (at < words.length && HOSTILE_FILLERS.has(words[at])) {
    if (at - from >= MAX_HOSTILE_FILLERS) return -1;
    at++;
  }
  return at;
}

function directedHostility(text: string): boolean {
  for (const clause of text.split(HOSTILITY_CLAUSE_END)) {
    const base = wordsOf(clause);
    const views = [
      base,
      base.map((w) => squeezedVariants(w)[1]),
      base.map((w) => squeezedVariants(w)[2]),
    ];
    for (const words of views) {
      for (let at = 0; at < words.length; at++) {
        /* "you suck", "u really suck", "you guys suck" */
        if (HOSTILE_PRONOUNS.has(words[at])) {
          const verb = afterFillers(words, at + 1);
          if (
            (words[verb] === "suck" || words[verb] === "sucks") &&
            !LITERAL_SUCK_FOLLOWERS.has(words[verb + 1]) &&
            !negatedBefore(words, at)
          ) {
            return true;
          }
        }
        /* "I hate you", "we really hate you", and "hate you" on its own at
           the start of a sentence. */
        const subject = HOSTILE_SUBJECTS.has(words[at]);
        if (!subject && at !== 0) continue;
        const verb = subject ? afterFillers(words, at + 1) : at;
        if (words[verb] !== "hate" || !HOSTILE_PRONOUNS.has(words[verb + 1])) {
          continue;
        }
        const tail = words[verb + 2];
        if (tail !== undefined && !HATE_TAIL.has(tail)) continue;
        if (!negatedBefore(words, at)) return true;
      }
    }
  }
  return false;
}

/* ── Links ───────────────────────────────────────────────────────────── */

/* A scheme or "www." link, or a bare domain on a TLD that spam favours. Common
   country codes are left out because they collide with ordinary text
   ("thanks.It"). Anything preceded by "@", a letter, a dot or a hyphen is not a
   link start, so an e-mail address is not counted. */
const LINK_RE =
  /(?<![@\w.-])(?:https?:\/\/[^\s<>"')\]]+|www\.[^\s<>"')\]]+|[a-z0-9][a-z0-9-]*(?:\.[a-z0-9-]+)*\.(?:com|net|org|io|dev|app|ai|xyz|top|site|online|shop|info|biz|link|click|club|live|store|tech|ru|cn)(?:\/[^\s<>"')\]]*)?(?![\w-]))/gi;

const SCHEME_OR_WWW_RE = /(?:https?:\/\/|www\.)/i;

function linkSpam(text: string): boolean {
  const lowered = text.normalize("NFKC").toLowerCase();
  const links = lowered.match(LINK_RE) ?? [];
  if (links.length === 0) return false;
  if (links.length > MAX_LINKS_IN_MESSAGE) return true;

  const counts = new Map<string, number>();
  for (const link of links) {
    const key = link.replace(/[.,;:!?)\]]+$/, "");
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  if ([...counts.values()].some((n) => n > MAX_REPEATS_OF_ONE_LINK)) {
    return true;
  }

  const around = lowered.replace(LINK_RE, " ").replace(/\s+/g, " ").trim();
  return links.length >= 2 && around.length < MIN_TEXT_AROUND_LINKS;
}

/* ── Evaluation ──────────────────────────────────────────────────────── */

type FieldKind = "message" | "name";

interface FieldResult {
  block: BlockReason | null;
  flags: Set<FlagReason>;
}

function evaluateField(raw: string, field: FieldKind): FieldResult {
  const result: FieldResult = { block: null, flags: new Set() };
  const normalized = normalizeForModeration(raw);
  const inName = field === "name";

  /* The same text, read four ways. A token is matched whole in each. */
  const plain = wordsOf(normalized);
  const tokens = new Set<string>();
  for (const base of [
    ...plain,
    ...wordsOf(decodeLeet(normalized)),
    ...spacedLetterTokens(normalized),
  ]) {
    for (const variant of squeezedVariants(base)) tokens.add(variant);
  }

  let slur = false;
  let profanity = false;
  let ambiguous = false;
  for (const token of tokens) {
    if (SLUR_RE.test(token)) slur = true;
    else if (!inName && SLUR_NOT_FOR_NAMES_RE.test(token)) slur = true;
    if (PROFANITY_RE.test(token)) profanity = true;
    else if (!inName && PROFANITY_NOT_FOR_NAMES_RE.test(token)) {
      profanity = true;
    }
    if (!inName && AMBIGUOUS_RE.test(token)) ambiguous = true;
  }

  const masked = maskedMatches(normalized);
  slur = slur || masked.slur;
  profanity = profanity || masked.profanity;

  const decoded = decodeLeet(normalized);
  const phrases = [normalized, decoded].map((text) => wordsOf(text).join(" "));
  const threat = phrases.some((p) => THREAT_RES.some((re) => re.test(p)));
  const sexual = phrases.some((p) => SEXUAL_ABUSE_RES.some((re) => re.test(p)));
  if (phrases.some((p) => PROFANITY_PHRASE_RES.some((re) => re.test(p)))) {
    profanity = true;
  }
  const directed =
    phrases.some((p) => DIRECTED_ABUSE_RES.some((re) => re.test(p))) ||
    directedInsult(normalized) ||
    directedInsult(decoded) ||
    directedHostility(normalized) ||
    directedHostility(decoded);

  const links = inName
    ? SCHEME_OR_WWW_RE.test(normalized)
    : linkSpam(raw.slice(0, PROCESSING_CEILING));

  if (slur) result.block = "slur";
  else if (threat) result.block = "threat";
  else if (sexual) result.block = "sexual_abuse";
  else if (directed) result.block = "directed_abuse";
  else if (links) result.block = "link_spam";

  if (profanity) result.flags.add("profanity");
  if (ambiguous) result.flags.add("ambiguous_term");
  return result;
}

/**
 * Judges a feedback submission's free text: the `message` and the optional
 * credit `name`. Anything that is not a non-empty string is skipped, so it is
 * safe to call on unvalidated input (the API validates first, but this does
 * not rely on it).
 *
 * Returns a reason code only. It never returns, echoes or logs any of the text.
 */
export function moderateFeedback(input: ModerationInput): ModerationVerdict {
  const fields: [unknown, FieldKind][] = [
    [input?.message, "message"],
    [input?.name, "name"],
  ];
  const flags = new Set<FlagReason>();

  for (const [value, field] of fields) {
    if (typeof value !== "string" || value.trim() === "") continue;
    const result = evaluateField(value, field);
    if (result.block) return { action: "block", reason: result.block };
    result.flags.forEach((flag) => flags.add(flag));
  }

  return flags.size > 0
    ? { action: "flag", reasons: [...flags] }
    : { action: "allow" };
}
