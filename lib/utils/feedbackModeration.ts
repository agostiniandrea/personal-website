/* ---------------------------------------------------------------------------
 * Feedback content moderation
 *
 * A small, dependency-free respect filter for the public feedback form, run on
 * the server (pages/api/feedback.ts) because the client cannot be trusted.
 * English and Italian only.
 *
 * POLICY: zero tolerance. The feedback form is a respectful space. Negative
 * opinions and strong criticism are welcome ("the navigation is slow", "I
 * strongly dislike this design", "the contrast is terrible"). Profanity, vulgar
 * language, insults, slurs, blasphemous profanity and hostility are not: a
 * message that contains any of them is refused, even if the rest of it is
 * constructive, and whether or not the language is aimed at anybody ("fuck,
 * this looks amazing" and "this design is stupid" are refused). Context is no
 * excuse for a prohibited word: "I'm not an idiot" and "I felt like an idiot"
 * are refused too.
 *
 * It answers one question per submission and returns one of two verdicts:
 *
 *   block  The submission is refused (HTTP 400) and nothing is stored.
 *   allow  Nothing to report.
 *
 * There is deliberately no third "flag" outcome: prohibited language is never
 * accepted and parked as `pending`. This module never touches status, trees
 * or counters; it only answers.
 *
 * Categories. The code is for the server log only; the client always gets the
 * same generic answer, so nobody learns which rule matched.
 *
 *   slur            Discriminatory abuse. Terms with no everyday meaning.
 *   threat          Credible threats ("I will kill you"), as phrase patterns.
 *   sexual_abuse    Abusive sexual content, as phrase patterns.
 *   directed_abuse  Fixed hostility at the reader ("fuck you", "vaffanculo",
 *                   "ti odio", "fai schifo", "you suck", "I hate you") and an
 *                   insult noun next to "you".
 *   link_spam       Link dumps; a few legitimate links are fine.
 *   profanity       Any profane, vulgar, insulting or blasphemous term,
 *                   anywhere in the text: "fuck", "shit", "cazzo", "stupid",
 *                   "stupido", "coglione", "porco dio", "fa schifo", "sucks".
 *
 * Design rules:
 *  - Whole tokens only. Matching never looks inside a word, so "class",
 *    "assess", "cockpit", "Scunthorpe", "Dickens" or the surname "Cazzola"
 *    cannot trigger anything.
 *  - Obfuscation is undone before matching (see `normalizeForModeration` and
 *    the views below), but only in ways that cannot turn ordinary text into a
 *    match: digits are decoded only inside tokens that also contain letters,
 *    masks (f*ck) need at least two literal letters and the exact length of a
 *    listed word, and spaced-out letters (f u c k) need a run of three or more
 *    (every stretch of the run is tried, so a neighbouring "a" or "e" cannot
 *    hide the word).
 *  - Strong criticism without a prohibited word is allowed: "terrible",
 *    "awful", "poorly designed", "disgusting", "garbage" and "I hate this
 *    navigation" are opinions, not vulgarity.
 *  - Threats and sexual abuse are phrase patterns, never single words. A bare
 *    "kill" proves nothing; "I will kill you" does, and "this will kill your
 *    SEO" does not.
 *  - Exceptions are few, explicit and reviewed. Each is listed next to its
 *    data and covered by a test. An exception only ever covers its own words:
 *    it never excuses another insult in the same field, in any spelling
 *    (plain, spaced, masked or repeated letters). Name-safe words are skipped
 *    one token at a time, and the phrases below are removed from the text
 *    before matching, so whatever is left is still judged in full.
 *      · NAME-SAFE words: "Dick", "Cock", "Fanny", "Troia" and "Kike" are real
 *        first names or surnames. In the `name` field, and nowhere else, the
 *        FIRST such word is ignored, once, if it reads as that exact word
 *        after Unicode normalisation (below). Everything else is judged with
 *        no excuse:
 *          - a second name-safe word ("Dick Dick", "Fanny Troia");
 *          - other inflections ("dicks", "dickhead") and compounds ("Dick
 *            Head", "Cock Sucker", "Big Dick", "Dick Pic");
 *          - any spelling that has to be DECODED, not just normalised, to be
 *            read: leetspeak ("D1ck", "Dick2"), spaced or dotted letters ("d i
 *            c k"), masks ("D*ck"), repeated letters ("Dickkk").
 *        Normalisation is applied before the exception, so it does not break
 *        it: full-width letters, accents, soft hyphens, zero-width and other
 *        invisible characters, and Cyrillic or Greek look-alikes that
 *        `normalizeForModeration` maps to Latin all leave the same plain name,
 *        which is still ONE occurrence of that name. This hides nothing: the
 *        same normalisation runs on the whole field first, so no other word
 *        can be hidden by it. In a message the same words are refused.
 *      · "idiot-proof", "dumb component/terminal/pipe/..." and "spic and span"
 *        are ordinary design, engineering and cleaning terms (see
 *        `BENIGN_PHRASES`).
 *      · Literal "suck" ("suck the colour out of the image", "suck up the
 *        water") is not vulgar, but only with positive evidence of a physical
 *        object (see `isLiteralSuck`). A particle after the verb is not
 *        enough: "you suck up", "go suck up", "this website sucks up my
 *        time" and "this sucks the loading is slow" are refused.
 *      · "Jesus Christ" on its own is a name, not a profanity, and is allowed.
 *        Explicit imprecations ("goddamn", "god damn it", "jesus fucking
 *        christ", "porco dio") are refused.
 *      · Ambiguous words with a rude and an everyday meaning ("chink",
 *        "dyke", "coon", "negro", "finocchio") are NOT on a list at all: a
 *        precise rule that never blocks a real visitor beats a long one that
 *        does. This also means they are not refused.
 *  - Nothing here echoes or logs the text. The result carries a reason code and
 *    nothing else, so a caller has no way to leak the content by accident.
 *
 * Known limits. This is not an exhaustive list and does not claim to be:
 *  - Only English and Italian. Insults in other languages, regional dialects
 *    and new slang are not covered.
 *  - Creative spellings beyond the obfuscations above (a letter swapped for an
 *    unrelated one, words glued into a longer string, text in images or
 *    emoji) get through. Words are never matched inside a longer word.
 *  - Italian "deficiente" and English "stupid" are refused even in their
 *    everyday senses ("contrasto deficiente", "stupid simple"). That is an
 *    intentional trade-off of the strict policy.
 *  - Context is never read: negation, quotation and self-reference do not
 *    excuse a prohibited word. Milder criticism ("terrible", "pessimo",
 *    "schifoso") is allowed.
 *  - Only `message` and `name` are moderated as free text. E-mail and the
 *    three link fields are validated by shape in the API.
 *  - Only the first PROCESSING_CEILING characters of a field are read; the API
 *    caps the message far below that.
 *
 * The lists are data, kept at the top of the file so they can be reviewed and
 * extended without touching the matching code. Add a word by adding an
 * alternative to the right group, then add a test beside it.
 * ------------------------------------------------------------------------- */

export type BlockReason =
  | "slur"
  | "threat"
  | "sexual_abuse"
  | "directed_abuse"
  | "link_spam"
  | "profanity";

export type ModerationVerdict =
  { action: "allow" } | { action: "block"; reason: BlockReason };

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
  "kikes",
  "spics?|wops?|beaners?|honk(?:y|ey|ies)|shemales?",
  "spaz|spazz|spastics?",
  // Italian
  "froc(?:io|ia|ie|i)",
  "ricchion(?:e|i|a)",
  "culatton(?:e|i)",
];

/* A slur that is also a real first name (Spanish "Kike", for Enrique), so it is
   ignored in `name`, in exactly this form. The plural stays a slur everywhere. */
const SLUR_TOKENS_NOT_FOR_NAMES = ["kike"];

/* Profanity and vulgar language: refused, aimed at anybody or not. */
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
  "wtf|stfu|gtfo|fml|omfg",
  "shite|shyte|bullcrap|horsecrap|dammit|bollox|mofos?",
  "fukin|fuckin|effing|biatch|beotch|bytch",
  "arsewipes?|assclowns?|dipshits?|dumbfucks?",
  "pussy|pussies|tits|titties",
  "dicks|dickheads?|dickwads?|cocks|pricks?",
  "retard(?:s|ed)?|fags?",
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
  "troie|troiata|troiate",
  "cag(?:are|ata|ate|ato|ona|one|oni)",
  "pirl(?:a|e|i)",
  "baldracc(?:a|he)",
  "fica|fregn(?:a|e|accia|accie)",
  "incul(?:are|ato|ata|ati|ate|o)",
  "rompipalle|rompiballe|rompicazzo",
  "pomp(?:ino|ini|inara|inare)|sborr(?:a|are|ata|ate)|segaiol(?:o|i)",
  "chiav(?:are|ata|ate)",
  "sfigat(?:o|a|i|e)",
  "porcat(?:a|e)|porcheri(?:a|e)|schifezz(?:a|e)",
  "scassacazz(?:o|i)",
  // "schifo" is the colloquial "it sucks": "fa schifo", "che schifo", "fai
  // schifo". "schifoso", "disgustoso" and "pessimo" are allowed criticism.
  "schifo",
  // Italian blasphemy written as one word. The spaced forms are phrase
  // patterns below.
  "porc(?:odio|amadonna|ocristo|ogesu)",
  "dio(?:cane|can|porco|maiale|bestia|boia|merda|ladro|stronzo|bono|bastardo)",
  "madonna(?:puttana|troia|porca|cagna|maiala)",
];

/* Insults: words that call somebody (or something) stupid or worthless. They
   are refused wherever they appear, including "this design is stupid" and
   "I'm not an idiot". "terrible", "awful", "pessimo" and "poorly designed"
   are criticism, not insults, and are allowed. */
const INSULT_TOKENS = [
  "stupid(?:er|est|ly|ity)?|dumb|loser|losers",
  "idiot(?:s|ic|ically)?|moron(?:s|ic)?|imbecil(?:e|es|ic)|cretin(?:s|ous)?",
  // Italian
  "stupid(?:o|a|i|e|issim[oaie]|aggin[ei]|ita)",
  "idiot(?:a|i|e|aggine|aggini)|idiozi(?:a|e)",
  "scem(?:o|a|i|e|issim[oaie]|enza|enze)",
  "cretin(?:o|a|i|e|ata|ate)",
  "imbecill(?:e|i|ita|aggine)",
  "deficient(?:e|i)",
  "rincoglionit[oaie]",
  "deficent(?:e|i)|defficient(?:e|i)",
  "dement(?:e|i)|ebete|ebeti|babbe(?:o|i)",
  "scimunit[oaie]|rimbambit[oaie]|decerebrat[oaie]",
  "cretinat(?:a|e)|stupidat(?:a|e)",
  // English, other everyday insults
  "(?:dim|nit|half)wits?|numb?skulls?|airheads?|birdbrains?|blockheads?",
  "buffoons?|dunces?|simpletons?|lowlifes?|dirtbags?|sleazebags?|scumbags?",
];

/* Profanity that is also somebody's first name or surname, in exactly this
   form. Ignored in the `name` field only: a visitor called Dick, Fanny or Troia
   is not a problem. In a message they are refused like any other rude word, and
   every other form ("dicks", "dickhead", "cocks", "troie") is refused in a name
   too, because those are not names. */
const PROFANITY_TOKENS_NOT_FOR_NAMES = ["dick", "cock", "fanny", "troia"];

/* Nouns that name a person and insult them. Every one of them is refused
   wherever it appears; what this list adds is the reason code: next to a
   second-person word ("you idiot", "u dumbfuck") the refusal is
   `directed_abuse` rather than `profanity`. "fuck" and "shit" are NOT here:
   they describe things as often as people ("what the fuck is this nav"). */
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

/* Words that are most often masked ("f*ck", "n*gger", "sh#t"). Compared
   position by position against a token that contains a mask character. Every
   entry is a word the lists above already refuse, at least four letters long,
   so a mask can only ever reveal a refused word. */
const MASKABLE_SLURS = [
  "nigger",
  "niggers",
  "nigga",
  "niggas",
  "faggot",
  "faggots",
  "frocio",
  "froci",
  "ricchione",
];
const MASKABLE_PROFANITY = [
  "suck",
  "sucks",
  "sucked",
  "fuck",
  "fucks",
  "fucked",
  "fucker",
  "fuckers",
  "fucking",
  "fuckin",
  "fuckhead",
  "fuckface",
  "motherfucker",
  "motherfuckers",
  "shit",
  "shits",
  "shitty",
  "shithead",
  "bullshit",
  "bitch",
  "bitches",
  "bastard",
  "bastards",
  "asshole",
  "assholes",
  "dick",
  "dicks",
  "dickhead",
  "cock",
  "cocks",
  "pussy",
  "whore",
  "whores",
  "slut",
  "sluts",
  "cunt",
  "cunts",
  "twat",
  "wanker",
  "crap",
  "damn",
  "goddamn",
  "moron",
  "retard",
  "retarded",
  "stupid",
  "idiot",
  "idiots",
  "dumbass",
  "jackass",
  "prick",
  "cazzo",
  "cazzi",
  "cazzata",
  "merda",
  "merde",
  "stronzo",
  "stronza",
  "stronzi",
  "stronzata",
  "puttana",
  "puttane",
  "troia",
  "troie",
  "coglione",
  "coglioni",
  "vaffanculo",
  "minchia",
  "figa",
  "culo",
  "stupido",
  "stupida",
  "stupidi",
  "idiota",
  "idioti",
  "cretino",
  "cretina",
  "scemo",
  "scema",
  "imbecille",
  "deficiente",
];
/* What can stand in for a hidden letter. `_` and `&` appear in ordinary text
   ("snake_case", "R&D"), which is harmless: a chunk is only refused when it is
   exactly as long as a listed word and agrees with it on every other letter. */
const MASK_CHARS = "*#_%&~^";

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

/* Fixed insults aimed at the reader. A pronoun is part of the pattern or the
   phrase can only be aimed at a person ("vaffanculo", "testa di cazzo"). */
const DIRECTED_ABUSE_PATTERNS = [
  String.raw`\bfuck\s+(?:you|u|yourself|urself|off)\b`,
  String.raw`\bgo\s+(?:and\s+)?(?:fuck|screw)\s+(?:yourself|urself)\b`,
  String.raw`\b(?:you|u|youre|ur)\s+(?:are\s+|re\s+|r\s+)?(?:(?:a|an|such|just|absolute|complete|total|utter|fucking|real)\s+)*piece\s+of\s+(?:shit|crap|garbage|trash)\b`,
  String.raw`\bscrew\s+(?:you|u|yourself|urself)\b`,
  // Italian
  String.raw`\b(?:ti|vi)\s+odio\b`,
  String.raw`\b(?:fai|fate)\s+(?:(?:proprio|davvero|veramente|molto|cosi|pure)\s+){0,2}(?:schifo|cagare)\b`,
  String.raw`\b(?:vaffanculo|vafanculo|affanculo|fanculo|vaffancul|fottiti|testa\s+di\s+(?:cazzo|merda)|pezzo\s+di\s+(?:merda|stronzo)|figlio\s+di\s+puttana|vai\s+a\s+(?:cagare|fanculo))\b`,
  String.raw`\b(?:tu\s+)?(?:sei|siete)\s+(?:(?:un|una|proprio\s+un|solo\s+un|davvero\s+un)\s+)?(?:coglione|coglioni|stronzo|stronza|stronzi|idiota|idioti|imbecille|imbecilli|cretino|cretini|deficiente|deficienti|bastardo|bastardi)\b`,
];

/* Blasphemous profanity that only shows as a phrase. "dio", "madonna" and
   "cristo" alone are ordinary words and are never matched on their own; the
   phrase needs the profane partner. Written as one word ("diocane") the same
   expressions are in PROFANITY_TOKENS. Accents are already gone here. */
const PROFANITY_PHRASE_PATTERNS = [
  // Italian
  String.raw`\b(?:porco|porca|maledetto|maledetta)\s+(?:dio|madonna|gesu|cristo|signore|puttana|troia)\b`,
  String.raw`\bdio\s+(?:cane|can|porco|bestia|maiale|boia|merda|ladro|stronzo|bastardo|bono|infame|lurido|schifoso|impestato)\b`,
  String.raw`\bmadonna\s+(?:puttana|troia|porca|cagna|maiala|bastarda|impestata|ladra|merda|boia)\b`,
  String.raw`\b(?:gesu|cristo)\s+(?:porco|maiale|merda|bastardo|cane)\b`,
  // Rude commands and curses
  String.raw`\bshut\s+(?:up|your\s+(?:mouth|face|trap|hole))\b`,
  String.raw`\b(?:go\s+to|burn\s+in|rot\s+in)\s+hell\b`,
  String.raw`\b(?:stai|sta)\s+zitt[oa]\b`,
  String.raw`\bzitt[oa]\s+tu\b`,
  String.raw`\bchiudi\s+(?:(?:la|il)\s+)?(?:bocca|becco)\b`,
  // English
  String.raw`\bgod\s+damn(?:ed|it)?\b`,
  // Compound insults built on a word that is a legitimate name on its own
  // ("Dick", "Cock"). The bare name is allowed in `name`; these are not names.
  String.raw`\b(?:dick|cock|prick)\s*(?:heads?|faces?|wads?|bags?|holes?|suckers?|brains?|breath|mongers?|lickers?|eaters?|pics?|pictures?|rings?|slaps?|sizes?|monsters?|jokes?)\b`,
  String.raw`\b(?:big|huge|hard|fat|tiny|small|long|thick|juicy|dirty|sexy|hot|limp|stiff|sucking|licking|lick|suck)\s*(?:dicks?|cocks?)\b`,
];

const anchored = (parts: string[]) => new RegExp(`^(?:${parts.join("|")})$`);
const anyOf = (patterns: string[]) => patterns.map((p) => new RegExp(p));

const SLUR_RE = anchored(SLUR_TOKENS);
const SLUR_NOT_FOR_NAMES_RE = anchored(SLUR_TOKENS_NOT_FOR_NAMES);
const PROFANITY_RE = anchored(PROFANITY_TOKENS);
const PROFANITY_NOT_FOR_NAMES_RE = anchored(PROFANITY_TOKENS_NOT_FOR_NAMES);
/* Every person-insult noun is an insult wherever it appears. */
const INSULT_RE = anchored([...INSULT_TOKENS, ...PERSON_INSULT_TOKENS]);
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
   from the next, read as one word. Single-letter words ("a", "e", "i", "o",
   "y", "u") often sit next to a spaced-out word ("è s t u p i d o e lento"), so
   every stretch of 3 to MAX_SPACED_WORD consecutive letters inside the run is
   tried as a word of its own, not just the whole run. Each stretch is then
   matched whole, like any other token. */
const MAX_SPACED_WORD = 14;

function spacedLetterTokens(normalized: string): string[] {
  const runs =
    normalized.match(/(?<![a-z0-9])[a-z](?:[ ._\-*]+[a-z]){2,}(?![a-z0-9])/g) ??
    [];
  const out = new Set<string>();
  for (const run of runs) {
    const letters = run.replace(/[^a-z]/g, "");
    for (let from = 0; from < letters.length; from++) {
      const longest = Math.min(letters.length, from + MAX_SPACED_WORD);
      for (let to = from + 3; to <= longest; to++) {
        out.add(letters.slice(from, to));
      }
    }
  }
  return [...out];
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
    if (MASK_CHARS.includes(char)) continue;
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
  const chunks = (normalized.match(/[a-z*#_%&~^]+/g) ?? []).filter(
    (chunk) => /[*#_%&~^]/.test(chunk) && /[a-z]/.test(chunk),
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

/* Fixed hostility at the reader with no profane noun in it: "you suck", "u
   suck", "I hate you". Two shapes: a second-person pronoun immediately
   followed by "suck(s)", and "I/we hate" immediately followed by a
   second-person pronoun. Both are about the author and say nothing about the
   page, so they are refused as `directed_abuse`.

   "suck(s)" is also refused anywhere else by `vulgarSuck`; this function only
   decides which reason code the refusal carries. "I hate you" is not covered
   by any other rule, so it needs this one. "hate" itself is an opinion and
   stays allowed ("I hate this navigation").

   The shapes are kept strict rather than clever:

   - Adjacency only: a few fillers such as "really" may sit between "I" and
     "hate", and nothing but the pronoun between "hate" and "you".
   - Each clause is judged on its own: a comma, colon, dash, bracket or full
     stop ends it. "I hate you, honestly." is therefore refused: what stands
     before the comma is exactly "I hate you".
   - Whatever follows "I hate you" in the same clause is hostility too ("I hate
     you with a passion", "so much", "have no talent", "are a liar", "can't
     design"), except the one shape "have to <page-use verb>" ("I hate you
     have to scroll"): see HATE_OBLIGATIONS. "I hate this navigation" and "I hate that you have
     to scroll" are not the shape at all, because "you" does not come right
     after "hate".
   - No context exception for "suck": "you don't suck" is refused like the
     rest, because `vulgarSuck` refuses the word wherever it appears. "hate" is
     an opinion and not a prohibited word, so only the fixed shape "I hate you"
     is refused; "I don't hate you" is not that shape and is allowed.
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
/* "suck" is literal only with POSITIVE evidence that something physical is
   being moved. The word after it is never enough on its own: "you suck up",
   "go suck up" and "this website sucks up my time" are colloquial or vulgar
   even though a particle follows. Two shapes count as evidence, both inside
   one clause and with no verb or conjunction in between:

     1. a particle, then a physical thing within three words: "suck up the
        water", "the pump sucks up the dust". The thing must be on
        LITERAL_SUCK_OBJECTS, a short list of substances. "time", "memory",
        "battery", "cache" and the like are not on it: "this app sucks up my
        memory" is a complaint, and a bare "suck up" or "suck dry" has no
        object at all.
     2. an article, then a removal word within three words: "suck the colour
        out of the image", "the vacuum sucks the dust off the keys", "suck the
        extra whitespace out". Possessives ("my", "your") do not start this
        shape: "suck my ... out" is not a literal use.

   Anything else is refused: "this sucks the loading is slow", "this sucks a
   lot", "it sucks my patience", "suck off", "suck dry the cache". The cost is
   that a rare literal sentence with another noun ("suck dry the cache") is
   refused until it is reworded. */
const SUCK_PARTICLES = new Set(["up", "out", "down", "dry", "away", "back"]);
const SUCK_ARTICLES = new Set(["the", "a", "an", "some", "any", "them"]);
/* "off" counts only here, AFTER an object: "sucks the dust off the keys". A
   particle straight after "suck" ("suck off") is vulgar and is not in
   SUCK_PARTICLES. */
const SUCK_REMOVAL_WORDS = new Set([
  "out",
  "up",
  "off",
  "down",
  "dry",
  "away",
  "from",
  "into",
  "through",
  "back",
]);
/* Physical things that are literally sucked up. Deliberately short, and not
   about the product: nothing here can be the subject of a complaint. */
const LITERAL_SUCK_OBJECTS = new Set([
  "water",
  "dust",
  "dirt",
  "air",
  "liquid",
  "liquids",
  "fluid",
  "fluids",
  "oil",
  "blood",
  "juice",
  "smoke",
  "fumes",
  "steam",
  "gas",
  "fog",
  "moisture",
  "sand",
  "snow",
  "rain",
  "mud",
  "hair",
  "crumbs",
  "debris",
  "spill",
  "spills",
  "puddle",
  "puddles",
  "ink",
  "paint",
  "colour",
  "colours",
  "color",
  "colors",
  "noise",
  "whitespace",
  "heat",
  "odour",
  "odor",
]);
/* A verb or a conjunction means a new statement has begun. */
const SUCK_STATEMENT_WORDS = new Set([
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "being",
  "has",
  "have",
  "had",
  "does",
  "do",
  "did",
  "will",
  "would",
  "can",
  "could",
  "should",
  "must",
  "and",
  "but",
  "because",
  "so",
  "when",
  "while",
  "that",
  "which",
]);
const SUCK_EVIDENCE_WINDOW = 3;

/* Looks at up to SUCK_EVIDENCE_WINDOW words starting at `from` for a word in
   `wanted`, giving up at a word that starts a new statement. */
function evidenceWithin(
  words: string[],
  from: number,
  wanted: Set<string>,
): boolean {
  for (let k = from; k < from + SUCK_EVIDENCE_WINDOW; k++) {
    const word = words[k];
    if (word === undefined || SUCK_STATEMENT_WORDS.has(word)) return false;
    if (wanted.has(word)) return true;
  }
  return false;
}

function isLiteralSuck(words: string[], at: number): boolean {
  const next = words[at + 1];
  if (next === undefined) return false;
  if (SUCK_PARTICLES.has(next)) {
    return evidenceWithin(words, at + 2, LITERAL_SUCK_OBJECTS);
  }
  if (SUCK_ARTICLES.has(next)) {
    return evidenceWithin(words, at + 2, SUCK_REMOVAL_WORDS);
  }
  return false;
}

/* A clause ends at sentence punctuation, a comma, a colon, a bracket or a
   spaced dash. */
const HOSTILITY_CLAUSE_END = /[.!?;,:()]+|\s[-\u2013\u2014]+\s/;
/* The ONE shape that is feedback after "I hate you": an obligation on the
   reader followed by a verb of using the page, "I hate you have to scroll so
   far", "I hate you need to log in". There "you" is the subject of what
   follows ("I hate [that] you have to scroll"), not the target of the hate.

   Everything else after "I hate you" in the same clause is hostility. Whether
   a verb after "you" starts a new clause cannot be told reliably from the
   words alone ("I hate you have no talent", "I hate you are a liar", "I hate
   you can't design", "I hate you will pay for this" read as insults), so
   auxiliaries and modals are NOT let through. Only "<have|has|had|need|needs|
   got> to <page-use verb>" is. A sentence that is refused although it is
   about the page ("I hate you can't search by tag") is the accepted cost of
   the strict policy: rewording it ("I hate that you can't search by tag")
   passes. To let a new construction through, add it here with a test. */
const HATE_OBLIGATIONS = new Set([
  "have",
  "has",
  "had",
  "need",
  "needs",
  "got",
]);
const HATE_PAGE_ACTIONS = new Set([
  "scroll",
  "click",
  "tap",
  "press",
  "swipe",
  "drag",
  "pinch",
  "zoom",
  "hover",
  "type",
  "enter",
  "fill",
  "log",
  "sign",
  "search",
  "scan",
  "wait",
  "open",
  "close",
  "reload",
  "refresh",
  "navigate",
  "accept",
  "dismiss",
  "confirm",
  "verify",
  "create",
  "register",
  "install",
  "download",
  "upload",
  "select",
  "choose",
  "switch",
  "repeat",
  "retype",
  "expand",
  "collapse",
  "toggle",
  "visit",
]);

function isPageObligation(words: string[], at: number): boolean {
  return (
    HATE_OBLIGATIONS.has(words[at]) &&
    words[at + 1] === "to" &&
    HATE_PAGE_ACTIONS.has(words[at + 2])
  );
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
            !isLiteralSuck(words, verb)
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
        /* "I hate you have to scroll": feedback, not hostility. */
        if (isPageObligation(words, verb + 2)) continue;
        return true;
      }
    }
  }
  return false;
}

/* "this navigation sucks", "the contrast sucked", "it sucks at loading": the
   colloquial verb is vulgar, aimed at a person or at the website, so it is
   refused as `profanity`. The literal verb is not ("how do you suck the
   colour out of this image", "the pump sucks up the water"); see
   `isLiteralSuck`. A bare "suck" at the end of a clause is refused, and so is a
   run-on with no punctuation ("this sucks the loading is slow"). */
const SUCK_FORMS = new Set(["suck", "sucks", "sucked"]);

function vulgarSuck(text: string): boolean {
  for (const clause of text.split(HOSTILITY_CLAUSE_END)) {
    const words = wordsOf(clause);
    for (let at = 0; at < words.length; at++) {
      if (!squeezedVariants(words[at]).some((w) => SUCK_FORMS.has(w))) continue;
      if (!isLiteralSuck(words, at)) return true;
    }
  }
  return false;
}

/* Ordinary phrases that contain a word the lists refuse. They are removed from
   the text before any matching, and only in exactly these shapes, so
   "idiot-proof" is fine while "you idiot" is not. Review a new entry as
   carefully as a new rude word: it is an exception to the policy.
     · "idiot-proof", "idiot-proofed": a design term for "hard to misuse".
     · "dumb component", "dumb terminal", "dumb pipe", ...: engineering terms. */
const BENIGN_PHRASES = [
  /\bidiot[\s-]?proof(?:ed|ing|s)?\b/g,
  /\bdumb[\s-]+(?:components?|terminals?|pipes?|clients?|ui|views?|widgets?)\b/g,
  /\bspick?\s+and\s+span\b/g,
];

function scrubBenignPhrases(normalized: string): string {
  return BENIGN_PHRASES.reduce((text, re) => text.replace(re, " "), normalized);
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

/* Judges one field and returns the reason it is refused, or null. */
function evaluateField(raw: string, field: FieldKind): BlockReason | null {
  const normalized = scrubBenignPhrases(normalizeForModeration(raw));
  const inName = field === "name";
  const decoded = decodeLeet(normalized);

  /* The same text, read four ways; a token is matched whole in each.

     Name-safe words ("Dick", "Troia", "Kike", ...) are excused in `name` only
     when they are written plainly, once. The allowance below is spent by the
     FIRST plain occurrence; a second one ("Dick Dick"), and every spelling
     that needed decoding to be read ("D1ck", "d i c k", "D.i.c.k", "Dickkk")
     is judged with no excuse at all. */
  const plain = wordsOf(normalized);
  const allowance = new Map<string, number>();
  if (inName) {
    const first = plain.find(
      (w) =>
        PROFANITY_NOT_FOR_NAMES_RE.test(w) || SLUR_NOT_FOR_NAMES_RE.test(w),
    );
    if (first) allowance.set(first, 1);
  }
  const takeAllowance = (token: string): boolean => {
    const left = allowance.get(token) ?? 0;
    if (left <= 0) return false;
    allowance.set(token, left - 1);
    return true;
  };

  let slur = false;
  let profanity = false;
  const judge = (token: string, mayBeName: boolean) => {
    if (SLUR_RE.test(token)) slur = true;
    else if (
      SLUR_NOT_FOR_NAMES_RE.test(token) &&
      !(mayBeName && takeAllowance(token))
    ) {
      slur = true;
    }
    if (PROFANITY_RE.test(token) || INSULT_RE.test(token)) profanity = true;
    else if (
      PROFANITY_NOT_FOR_NAMES_RE.test(token) &&
      !(mayBeName && takeAllowance(token))
    ) {
      profanity = true;
    }
  };

  /* 1. The words as written. */
  for (const word of plain) {
    judge(word, true);
    for (const variant of squeezedVariants(word).slice(1)) {
      if (variant !== word) judge(variant, false);
    }
  }
  /* 2. Words that only exist once leetspeak is decoded: what is left of the
        decoded words after the plain ones are taken out, one for one. */
  const unmatched = new Map<string, number>();
  for (const word of plain) unmatched.set(word, (unmatched.get(word) ?? 0) + 1);
  for (const word of wordsOf(decoded)) {
    const left = unmatched.get(word) ?? 0;
    if (left > 0) {
      unmatched.set(word, left - 1);
      continue;
    }
    for (const variant of squeezedVariants(word)) judge(variant, false);
  }
  /* 3. Spaced-out letters. "s u c k" is never a literal use of the verb. */
  for (const token of spacedLetterTokens(normalized)) {
    for (const variant of squeezedVariants(token)) {
      judge(variant, false);
      if (SUCK_FORMS.has(variant)) profanity = true;
    }
  }

  const masked = maskedMatches(normalized);
  slur = slur || masked.slur;
  profanity = profanity || masked.profanity;

  /* Phrases are matched on each text with its words as written and with
     letters repeated three or more times squeezed ("dioooo caneee"). */
  const phrases = [normalized, decoded].flatMap((text) =>
    [0, 1, 2].map((view) =>
      wordsOf(text)
        .map((word) => squeezedVariants(word)[view])
        .join(" "),
    ),
  );
  const threat = phrases.some((p) => THREAT_RES.some((re) => re.test(p)));
  const sexual = phrases.some((p) => SEXUAL_ABUSE_RES.some((re) => re.test(p)));
  if (phrases.some((p) => PROFANITY_PHRASE_RES.some((re) => re.test(p)))) {
    profanity = true;
  }
  if (vulgarSuck(normalized) || vulgarSuck(decoded)) profanity = true;
  const directed =
    phrases.some((p) => DIRECTED_ABUSE_RES.some((re) => re.test(p))) ||
    directedInsult(normalized) ||
    directedInsult(decoded) ||
    directedHostility(normalized) ||
    directedHostility(decoded);

  const links = inName
    ? SCHEME_OR_WWW_RE.test(normalized)
    : linkSpam(raw.slice(0, PROCESSING_CEILING));

  /* One reason per field, most serious first. Only the code is ever used. */
  if (slur) return "slur";
  if (threat) return "threat";
  if (sexual) return "sexual_abuse";
  if (directed) return "directed_abuse";
  if (links) return "link_spam";
  if (profanity) return "profanity";
  return null;
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

  for (const [value, field] of fields) {
    if (typeof value !== "string" || value.trim() === "") continue;
    const reason = evaluateField(value, field);
    if (reason) return { action: "block", reason };
  }

  return { action: "allow" };
}
