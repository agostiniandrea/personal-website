import {
  MAX_LINKS_IN_MESSAGE,
  moderateFeedback,
  normalizeForModeration,
} from "../feedbackModeration";

/* The characters below are built from code points, not typed, because a
   zero-width space or a Cyrillic "а" is invisible or identical on screen. */
const ZERO_WIDTH_SPACE = String.fromCharCode(0x200b);
const SOFT_HYPHEN = String.fromCharCode(0x00ad);
const CYRILLIC_A = String.fromCharCode(0x0430);
const CYRILLIC_O = String.fromCharCode(0x043e);
const CYRILLIC_I = String.fromCharCode(0x0456);
const CYRILLIC_R = String.fromCharCode(0x0440);

const verdict = (message: string, name?: string) =>
  moderateFeedback({ message, name });

const expectAllowed = (message: string, name?: string) =>
  expect(verdict(message, name)).toEqual({ action: "allow" });

const expectBlocked = (message: string, reason: string, name?: string) =>
  expect(verdict(message, name)).toEqual({ action: "block", reason });

/* Refused, whatever the reason: the policy is "no prohibited language". */
const expectRefused = (message: string, name?: string) =>
  expect(verdict(message, name).action).toBe("block");

const expectProfanity = (message: string, name?: string) =>
  expectBlocked(message, "profanity", name);

describe("moderateFeedback", () => {
  /* Every test must reach a verdict: a table that silently asserts nothing
     would pass whatever the moderation did. All the helpers above call
     moderateFeedback and compare its final verdict. */
  beforeEach(() => {
    expect.hasAssertions();
  });

  describe("clear abuse is blocked", () => {
    it.each([
      "You are a faggot and so is this site",
      "this nigger website is trash",
      "che schifo, sito da froci",
      "sei un ricchione, cancella tutto",
    ])("blocks a slur: %s", (message) => {
      expectBlocked(message, "slur");
    });

    it.each([
      "I will kill you if you keep this up",
      "i'm going to find you and hurt you",
      "We will murder your family",
      "I'll shoot you tomorrow",
      "just kill yourself already",
      "kys",
      "go die",
      "I hope you die",
      "i know where you live",
      "ti ammazzo, cancella questo sito",
      "t'ammazzo se non lo togli",
      "ammazzati",
      "so dove abiti",
      "spero che tu muoia",
    ])("blocks a threat: %s", (message) => {
      expectBlocked(message, "threat");
    });

    it.each([
      "suck my dick and fix the footer",
      "send nudes and I'll reconsider the rating",
      "I want to fuck you, nice portfolio",
      "mandami foto nude e ti dico cosa penso",
      "succhiami il cazzo",
      "ti scopo",
    ])("blocks abusive sexual content: %s", (message) => {
      expectBlocked(message, "sexual_abuse");
    });

    it.each([
      "fuck you",
      "FUCK OFF and stop building websites",
      "you are such a dumbass",
      "u idiot, who designed this",
      "asshole, you did this",
      "you absolute piece of shit",
      "vaffanculo",
      "sei un coglione",
      "testa di cazzo",
    ])("blocks an insult aimed at the person: %s", (message) => {
      expectBlocked(message, "directed_abuse");
    });

    /* The message that started this rule: harsh feedback is fine, an insult
       at the person is not. */
    it("blocks the reported message, which ends by insulting the author", () => {
      expectBlocked(
        "easily vibecoded 5 mins shit, it looks like an ai slop and im sick of it, at least put in some effort u dumbfuck",
        "directed_abuse",
      );
    });

    it("blocks abuse in the name as well as the message", () => {
      expectBlocked(
        "The layout is clear and easy to follow.",
        "slur",
        "faggot",
      );
      expectBlocked(
        "The layout is clear and easy to follow.",
        "threat",
        "I will kill you",
      );
    });

    it("lets a blocked field win over a clean one, in either order", () => {
      expectBlocked("fuck you", "directed_abuse", "Andrea");
      expectBlocked("The layout is clear.", "slur", "faggot");
    });
  });

  /* "you suck" and "I hate you" say nothing about the page: they are a verdict
     on the author, so they are refused like "you dumbfuck". The same words
     aimed at the product ("this navigation sucks", "I hate this navigation")
     are feedback and are covered in "benign text is left alone". */
  describe("personal hostility without a swear word", () => {
    it.each([
      "you suck",
      "You suck!",
      "u suck",
      "U SUCK",
      "u sucks",
      "you really suck",
      "u really really suck",
      "you guys suck",
      "you all suck",
      "you absolutely suck",
      "you suuuuck",
      "youuu suck",
      "y0u suck",
      "The spacing is off and you suck at design",
      "you suck, the navigation is slow and the menu is broken",
      "You suck - the contrast is terrible",
      "Honestly (you suck) but the layout is fine",
      "you suck: the hero image is huge",
      "you suck. This colour palette is the problem.",
      "I think you suck. Fix the header.",
      "honestly u suck lol",
    ])("blocks a verdict on the author: %s", (message) => {
      expectBlocked(message, "directed_abuse");
    });

    it.each([
      "I hate you",
      "i hate u",
      "I really hate you",
      "I just absolutely hate you",
      "we hate you",
      "I do hate you",
      "I hate you so much",
      "i hate you guys",
      "I hate you guys",
      "I hate you all",
      "I hate you too",
      "I hate you both",
      "we hate you all",
      "I hate you ALL!",
      "I hate you guys!!",
      "I hate you too.",
      "I hate you all so much",
      "I hate you lot",
      "I hate you people",
      "I hate you a lot",
      "I hate you very much",
      "I hate you more",
      "I hate you and your website",
      "I hate you with a passion",
      "I hate you with all my heart",
      "I hate you for this",
      "I hate you for making this",
      "I hate you because of the menu",
      "I hate you so",
      "I hate you!!!",
      "I hate you lol",
      "I hate you whoever built this",
      "We hate you with a passion",
      "I really hate you with a passion",
      "I hate u with a passion",
      "i hate ya",
      "I hate youuuu",
      "i h4te y0u",
      "hate you",
      "Ok. Hate you.",
      "The footer is broken. I hate you.",
      "I hate you, honestly.",
      "I hate you, the layout is fine but the author is not",
      "i hate you - fix the menu",
    ])("blocks hostility aimed at the author: %s", (message) => {
      expectBlocked(message, "directed_abuse");
    });

    /* "I hate you, honestly." is blocked on purpose. The comma ends the
       clause, so what precedes it is exactly "I hate you"; the afterthought
       does not turn it into feedback. A run-on with no punctuation, where
       "you" starts a new clause, is feedback and stays allowed (see the
       "benign text" block). */
    it("judges each clause on its own", () => {
      expectBlocked("I hate you, honestly.", "directed_abuse");
      expectBlocked("I hate you. Honestly.", "directed_abuse");
      expectAllowed("I hate you have to scroll so far to find the prices");
    });

    /* After "I hate you" only ONE shape is feedback: "have/need to" plus a
       verb of using the page. Whether any other verb starts a new clause
       cannot be told from the words alone ("I hate you have no talent" is an
       insult, "I hate you have to scroll" is not), so every other
       continuation is refused, including auxiliaries and modals. */
    it("allows only 'I hate you have/need to <page-use verb>' as feedback", () => {
      expectAllowed("I hate you have to scroll to find the prices");
      expectAllowed("I hate you have to scroll so far to find the prices");
      expectAllowed("I hate you need to log in just to read the page");
      expectAllowed("I hate you have to click twice to open a page");
      expectAllowed("I hate you has to tap three times");
      expectAllowed("I hate you had to wait for the menu");
      expectAllowed("I hate you got to scroll forever");
      expectAllowed("I don't hate you, the navigation is the problem");
    });

    it.each([
      "I hate you have no talent",
      "I hate you are a liar",
      "I hate you can't design",
      "I hate you cant design",
      "I hate you will pay for this",
      "I hate you do this on purpose",
      "I hate you don't care",
      "I hate you should be fired",
      "I hate you have a terrible taste",
      "I hate you have to go away",
      "I hate you have to be so lazy",
      "I hate you need to quit",
      "I hate you need to learn",
      "I hate you is the worst",
      "I hate you was a mistake",
      "I hate you ruin everything",
      "I hate you get what you deserve",
      "I hate you must be proud",
      "I hate you can't read",
      "I hate you hav no talent",
      "I hate you haaave no talent",
      "I H4TE y0u have no talent",
      "i hate u are a liar",
      "We hate you have no talent",
      "I really hate you are a liar",
      "hate you are a liar",
      "The menu is slow. I hate you can't design",
    ])("refuses an 'I hate you <anything else>' sentence: %s", (message) => {
      expectBlocked(message, "directed_abuse");
    });

    /* The accepted cost of a rule that does not guess: a sentence about the
       page that uses another verb is refused until it is reworded. */
    it("refuses a page complaint that is not in the allowed shape", () => {
      expectBlocked("I hate you can't search by tag", "directed_abuse");
      expectBlocked(
        "I hate you get logged out every five minutes",
        "directed_abuse",
      );
      expectBlocked(
        "I hate you must click twice to open a page",
        "directed_abuse",
      );
      expectBlocked(
        "I hate you don't remember my scroll position",
        "directed_abuse",
      );
      expectAllowed("I hate that you can't search by tag");
      expectAllowed("I hate that you get logged out every five minutes");
      expectAllowed("I hate it when you must click twice to open a page");
    });

    it("blocks the allowed shape when anything else in the field is prohibited", () => {
      expectRefused("I hate you have to scroll so far, you idiot");
      expectRefused("I hate you have to scroll. I hate you with a passion");
      expectRefused("I hate you have to scroll, f*ck");
      expectRefused("The layout is clear.", "I hate you");
    });

    it("does not touch 'hate' when 'you' does not follow it", () => {
      expectAllowed("I hate this navigation");
      expectAllowed("I hate that you have to scroll so far");
      expectAllowed("I hate how you have to scroll so far");
      expectAllowed("I hate when the menu hides what you need");
      expectAllowed("I hate the fact that you can't search");
      expectAllowed("Hate the animation, love the colours");
    });

    it("blocks the same words in the name field", () => {
      expectBlocked(
        "The layout is clear and easy to follow.",
        "directed_abuse",
        "you suck",
      );
      expectBlocked(
        "The layout is clear and easy to follow.",
        "directed_abuse",
        "I hate you",
      );
    });

    it("blocks when only the last sentence is hostile", () => {
      expectBlocked(
        "Helpful layout notes below. you suck",
        "directed_abuse",
        "Andrea",
      );
    });

    it("keeps its precedence: a slur or a threat in the same text wins", () => {
      expectBlocked("you suck, faggot", "slur");
      expectBlocked("you suck and I will kill you", "threat");
    });
  });

  describe("common obfuscations are seen through", () => {
    it.each([
      ["leetspeak", "f@ggot"],
      ["a mask character", "f*ggot"],
      ["a hash mask", "n#gger"],
      ["spaced letters", "n i g g e r"],
      ["dotted letters", "f.a.g.g.o.t"],
      ["a repeated letter", "faggggot"],
      ["full-width letters", "ｆａｇｇｏｔ"],
      ["a zero-width space", `fag${ZERO_WIDTH_SPACE}got`],
      ["a soft hyphen", `fag${SOFT_HYPHEN}got`],
      ["a Cyrillic look-alike", `f${CYRILLIC_A}ggot`],
      ["mixed case", "FaGgOt"],
    ])("still blocks a slur written with %s", (_label, text) => {
      expectBlocked(`you ${text} site`, "slur");
    });

    it.each([
      ["leetspeak", "5h1t"],
      ["a symbol for a letter", "sh!t"],
      ["a mask character", "sh*t"],
      ["a repeated letter", "shiiiit"],
      ["spaced letters", "s h i t"],
      ["full-width letters", "ｓｈｉｔ"],
      ["a Cyrillic look-alike", `sh${CYRILLIC_O}t`.replace(CYRILLIC_O, "i")],
    ])("still refuses profanity written with %s", (_label, text) => {
      expectProfanity(`the loading is ${text}`);
    });

    it.each([
      ["leetspeak", "c4zz0"],
      ["leetspeak", "c0gl10ne"],
      ["leetspeak", "stup1d0"],
      ["a mask", "c*zzo"],
      ["a mask", "st*pido"],
      ["a mask", "idi*ta"],
      ["a repeated letter", "stuuupido"],
      ["a repeated letter", "fuuuuck"],
      ["spaced letters", "s t u p i d o"],
      ["spaced letters", "c o g l i o n e"],
      ["full-width letters", "ｃｏｇｌｉｏｎｅ"],
      ["accents", "stúpído"],
      ["mixed case", "StUpIdO"],
    ])("still refuses a rude word written with %s: %s", (_label, text) => {
      expectRefused(`il menu è lento, ${text}, davvero`);
    });

    it("decodes a whole threat written in leetspeak", () => {
      expectBlocked("i w1ll k1ll y0u", "threat");
    });

    it("does not need the apostrophe in a contraction", () => {
      expectBlocked("ill kill you", "threat");
      expectBlocked("i'll kill you", "threat");
      expectBlocked("i’ll kill you", "threat");
    });

    it("reads Italian with or without accents", () => {
      expectBlocked("ti ucciderò", "threat");
      expectBlocked("ti uccidero", "threat");
    });
  });

  /* The policy, stated with its own examples. Anything below this block is
     detail; if one of these changes, the policy changed. */
  describe("the policy examples", () => {
    it.each([
      "stupido fuck coglione",
      "this design is stupid",
      "you are an idiot",
      "fuck this navigation, it's slow",
      "fuck, this looks amazing",
      "fai schifo",
      "ti odio",
    ])("refuses: %s", (message) => {
      expectRefused(message);
    });

    it.each([
      "The navigation is slow",
      "I strongly dislike this design",
      "This project is poorly designed",
      "The contrast is terrible",
      "I disagree with the design decisions",
      "This feature is frustrating and needs improvement",
      "this navigation is terrible",
      "La navigazione è lenta e il contrasto è pessimo",
      "questa navigazione è pessima",
    ])("allows: %s", (message) => {
      expectAllowed(message);
    });

    it("refuses prohibited language even inside constructive feedback", () => {
      expectProfanity(
        "The navigation is slow, the contrast is terrible and, fuck, I strongly dislike the design.",
      );
      expectProfanity(
        "Il menu è lento e il contrasto è pessimo. Per il resto, un lavoro stupido ma ben fatto.",
      );
    });

    it("never accepts prohibited language with a warning: only allow or block exist", () => {
      for (const message of [
        "fuck, this looks amazing",
        "this is shit",
        "The navigation is slow",
      ]) {
        expect(["allow", "block"]).toContain(verdict(message).action);
      }
    });
  });

  describe("English profanity and vulgar language", () => {
    const WORDS = [
      "fuck",
      "fucking",
      "motherfucker",
      "shit",
      "bullshit",
      "crap",
      "piss",
      "damn",
      "goddamn",
      "bitch",
      "bastard",
      "arse",
      "cunt",
      "wanker",
      "twat",
      "bollocks",
      "pussy",
      "dumbass",
      "wtf",
      "stfu",
      "omfg",
    ];

    it.each(
      WORDS.flatMap((word) => [
        `${word} the navigation is slow`,
        `the navigation is ${word} and slow`,
        `the navigation is slow ${word}`,
      ]),
    )("refuses at the start, middle and end: %s", (message) => {
      expectProfanity(message);
    });

    it.each([
      "this is bullshit",
      "what the fuck is this navigation",
      "the hero animation is fucking slow",
      "damn, the page jumps around on mobile",
      "this is crap",
      "piss poor loading",
      "holy shit that's slow",
      "that is goddamn slow",
      "god damn it, the menu does not open",
      "jesus fucking christ the navigation",
      "THE CONTRAST IS SHIT",
    ])("refuses vulgar language about the work: %s", (message) => {
      expectProfanity(message);
    });

    it.each([
      "this navigation sucks",
      "This site sucks on mobile, the menu does not open.",
      "the contrast sucks and you can't read the text",
      "the loading state really sucks",
      "the search sucked",
      "it sucks at loading",
      "this sucks",
      "Thank you. The footer sucks.",
      "this sucks the loading is slow",
      "this navigation sucks the menu is confusing",
      "this site sucks the contrast is terrible",
      "this sucks a lot",
      "it sucks my patience",
      "the form sucked the whole time",
      "the app sucks the battery is always empty",
    ])("refuses the colloquial verb 'suck': %s", (message) => {
      expectProfanity(message);
    });

    it.each([
      "How do you suck the colour out of this image?",
      "the pump sucks up the water",
      "Can you suck the data out of the CSV and into the table?",
      "the vacuum sucks the dust off the keys",
      "suck the colour out of this image",
      "suck up the water",
      "the pump will suck the water out of the tank",
      "suck the extra whitespace out",
      "it sucks the colour from the photo",
      "the filter sucks the noise out of the recording",
      "a fan that sucks the hot air away from the case",
    ])("allows the literal verb 'suck': %s", (message) => {
      expectAllowed(message);
    });
  });

  /* "suck" is literal only with positive evidence of a physical object. A
     particle after the verb is not enough. These three were allowed by an
     earlier rule that trusted the particle; they are refused now because
     "suck up/dry" without a physical thing is not reliably literal. */
  describe("the verb 'suck' needs evidence of a literal use", () => {
    it.each([
      ["you suck up", "directed_abuse"],
      ["go suck up", "profanity"],
      ["this website sucks up my time", "profanity"],
      ["you suck dry the cache and rebuild it", "directed_abuse"],
      ["suck dry the cache", "profanity"],
      [
        "Do you suck up all the memory? The page freezes the browser.",
        "directed_abuse",
      ],
      ["this app sucks up all my memory", "profanity"],
      ["the site sucks up my battery", "profanity"],
      ["this page sucks up my data", "profanity"],
      ["this sucks up", "profanity"],
      ["it sucks down my time", "profanity"],
      ["go suck up to the boss", "profanity"],
      ["suck up", "profanity"],
      ["suck up.", "profanity"],
      ["suck up, the menu is slow", "profanity"],
      ["suck out", "profanity"],
      ["suck dry", "profanity"],
      ["suck away", "profanity"],
      ["suck off", "profanity"],
      ["go suck off", "profanity"],
      ["suck it up", "profanity"],
      ["suck up my time and water", "profanity"],
      ["suck up my time", "profanity"],
    ])("refuses %s as %s", (message, reason) => {
      expect(verdict(message)).toEqual({ action: "block", reason });
      expect(verdict("The layout is clear.", message)).toEqual({
        action: "block",
        reason,
      });
    });

    it.each([
      "suck up the water",
      "Suck up the water",
      "the pump sucks up the water",
      "the pump sucks up the water from the tank",
      "suck up the dust",
      "the vacuum sucks up all the dust",
      "sucks up the spilled water",
      "the filter sucks the noise out of the recording",
      "suck the colour out of this image",
      "suck the extra whitespace out",
      "the vacuum sucks the dust off the keys",
      "How do you suck the colour out of this image?",
      "Can you suck the data out of the CSV and into the table?",
      "How do you suck up the water from the carpet?",
    ])("allows %s", (message) => {
      expect(verdict(message)).toEqual({ action: "allow" });
    });

    it.each([
      "the pump sucks up the water, you idiot",
      "suck up the water. this sucks up my time",
      "the pump sucks up the water and this website sucks up my time",
      "suck up the water, go suck up",
      "suck up the water. you suck up",
    ])("does not let a literal use excuse a vulgar one: %s", (message) => {
      expectRefused(message);
    });

    it("does not need the particle to be spelled the same way", () => {
      expectRefused("you suuuck up");
      expectRefused("you 5uck up");
      expectRefused("you s u c k up");
      expectRefused("go suck UP");
    });
  });

  describe("English insults", () => {
    it.each([
      "this design is stupid",
      "what a stupid navigation",
      "the stupidest menu I have seen",
      "this is idiotic",
      "a moronic layout",
      "this is dumb",
      "what a loser site",
      "you are an idiot",
      "you are stupid",
      "who is the moron that built this",
      "imbecile",
      "cretins",
    ])("refuses: %s", (message) => {
      expectRefused(message);
    });

    /* The policy does not read context: a prohibited word is refused whether
       it insults the reader, the author, the site, or nobody. */
    it.each([
      "I'm not an idiot",
      "you are not an idiot, the form is just confusing",
      "I felt like an idiot when I could not find the menu",
      "I am not stupid, but this menu is confusing",
      "This is not stupid, just slow",
      "I don't think you suck, the design is fine but slow",
      "you don't suck, the navigation just needs work",
      "no, you do not suck at all, the layout is great",
    ])("refuses even when negated or about oneself: %s", (message) => {
      expectRefused(message);
    });

    it.each([
      "make the checkout idiot-proof, you will thank yourself",
      "you idiot-proofed the form nicely",
      "an idiot proof flow",
      "a dumb component with no state",
      "the dumb terminal look is cute",
      "a deficient contrast ratio",
    ])("allows the ordinary phrase: %s", (message) => {
      expectAllowed(message);
    });
  });

  describe("Italian profanity and vulgar language", () => {
    const WORDS = [
      "cazzo",
      "cazzata",
      "merda",
      "stronzo",
      "stronzata",
      "minchia",
      "figa",
      "culo",
      "puttana",
      "troia",
      "coglione",
      "cagare",
      "cagata",
      "pirla",
      "baldracca",
      "schifo",
      "incazzato",
      "fottuto",
    ];

    it.each(
      WORDS.flatMap((word) => [
        `${word} il menu è lento`,
        `il menu è ${word} e lento`,
        `il menu è lento ${word}`,
      ]),
    )("refuses all'inizio, in mezzo e alla fine: %s", (message) => {
      expectProfanity(message);
    });

    it.each([
      "Questa pagina è una merda, il caricamento è lento",
      "cazzo, il menu non si apre su mobile",
      "che cazzata il carosello",
      "questa navigazione fa schifo",
      "che schifo il caricamento",
      "il design fa schifo",
      "i menu fanno schifo",
      "Mi fa schifo la navigazione, il menu è confuso",
      "la navigazione fa cagare",
      "che palle, e poi minchia quanto è lento",
    ])("refuses: %s", (message) => {
      expectProfanity(message);
    });

    it.each([
      "La navigazione è lenta e il contrasto è pessimo",
      "questa navigazione è pessima",
      "Il design è brutto, il sito è lento e il menu è inutilizzabile.",
      "Il sito è orribile e il caricamento è inaccettabile",
      "Trovo il menu schifoso e disgustoso",
    ])("allows strong criticism: %s", (message) => {
      expectAllowed(message);
    });
  });

  describe("Italian insults", () => {
    it.each([
      "stupido",
      "stupida",
      "stupidi",
      "stupide",
      "stupidissimo",
      "scemo",
      "scema",
      "idiota",
      "idioti",
      "deficiente",
      "deficienti",
      "cretino",
      "cretina",
      "imbecille",
      "imbecilli",
      "coglione",
      "rincoglionito",
    ])("refuses the insult '%s' anywhere", (word) => {
      expectRefused(`questo design è ${word}`);
      expectRefused(`${word} questo design`);
      expectRefused(`questo design, ${word}`);
    });

    /* "deficiente" also means "lacking". Refusing "contrasto deficiente" is a
       deliberate trade-off of the strict policy, not an oversight. */
    it("refuses 'deficiente' even in its everyday sense", () => {
      expectProfanity("il contrasto è deficiente");
    });

    it("refuses an insult built on a person-noun", () => {
      expectBlocked("sei un coglione", "directed_abuse");
      expectBlocked("sei stronzo", "directed_abuse");
      expectProfanity("sei uno stronzo");
      expectBlocked("tu sei un cretino", "directed_abuse");
      expectBlocked("siete degli imbecilli", "profanity");
    });
  });

  describe("direct hostility", () => {
    it.each([
      "ti odio",
      "Ti odio!",
      "vi odio",
      "io ti odio proprio",
      "ti odio, sito inutile",
      "ti odiooo",
      "fai schifo",
      "fate schifo",
      "mi fai schifo",
      "fai proprio schifo",
      "voi fate davvero schifo",
      "tu fai schifo come sviluppatore",
      "fai cagare",
      "fate cagare",
      "I hate you",
      "you suck",
      "u suck",
      "u really suck",
      "you guys suck",
      "screw you",
    ])("refuses: %s", (message) => {
      expectBlocked(message, "directed_abuse");
    });

    /* "hate" is an opinion, not a prohibited word, and "odio" likewise: what is
       refused is the hostility shape aimed at the reader. */
    it.each([
      "I hate this navigation",
      "I hate the carousel; it kills performance and it is useless.",
      "I hate you have to scroll so far to find the prices",
      "odio questa navigazione",
      "non mi piace affatto il menu",
      "I don't hate you, the navigation is the problem",
    ])("allows an opinion about the work: %s", (message) => {
      expectAllowed(message);
    });
  });

  describe("Italian blasphemous profanity", () => {
    it.each([
      "porco dio",
      "porcodio",
      "dio porco",
      "dio cane",
      "diocane",
      "dio can",
      "dio maiale",
      "dio bestia",
      "dio boia",
      "dio merda",
      "dio ladro",
      "dio stronzo",
      "dio bono",
      "madonna puttana",
      "madonna troia",
      "madonna porca",
      "madonna cagna",
      "porca madonna",
      "porca puttana",
      "porca troia",
      "porco gesù",
      "porco cristo",
      "cristo porco",
      "cristo bastardo",
      "maledetto dio",
    ])("refuses the blasphemy '%s'", (phrase) => {
      expectRefused(phrase);
      expectProfanity(`il caricamento è lento, ${phrase}, riparatelo`);
    });

    it.each([
      ["upper case", "PORCO DIO"],
      ["mixed case and accents", "Porco Gesù"],
      ["repeated letters", "dioooo caneee"],
      ["repeated letters inside the word", "porrrco diooo"],
      ["spaced letters", "d i o c a n e"],
      ["leetspeak", "d1o c4ne"],
      ["full-width letters", "ｄｉｏ　ｃａｎｅ"],
      ["a zero-width space", `dio${ZERO_WIDTH_SPACE}cane`],
      ["extra spaces and punctuation", "dio   -   cane"],
    ])("sees through %s", (_label, text) => {
      expectRefused(`il menu è lento, ${text}`);
    });

    it.each([
      "goddamn",
      "god damn it",
      "God damned menu",
      "jesus fucking christ",
      "g0ddamn",
    ])("refuses the English equivalent '%s'", (phrase) => {
      expectProfanity(`the navigation is slow, ${phrase}`);
    });

    /* "Jesus Christ" on its own is a name (a film, a play, a person), not an
       imprecation, so it is not refused automatically. The explicit
       expressions around it are. */
    it.each([
      "Jesus Christ",
      "Jesus Christ Superstar is in my playlist",
      "Jesus Christ the navigation is slow",
      "jesus christ",
      "Gesù Cristo Superstar",
    ])("allows 'Jesus Christ' used on its own: %s", (message) => {
      expectAllowed(message);
    });

    it("still refuses 'Jesus Christ' next to a prohibited word", () => {
      expectProfanity("Jesus Christ this is shit");
      expectRefused("Jesus Christ, you idiot");
      expectRefused("Jesus Christ f*ck");
      expectProfanity("jesus fucking christ");
    });

    it.each([
      "Dio mio che bello questo sito",
      "Madonna di Campiglio è bellissima",
      "La Madonna con il Bambino nella galleria",
      "il Cristo Redentore nella foto",
      "Gesù Cristo Superstar nella playlist",
      "Ostia Lido sulla mappa",
      "il porco selvatico nel menu",
      "il mio cane ama il sito",
      "un dio greco nell'illustrazione",
      "in nome di Dio, grazie",
    ])("allows an ordinary use of the same words: %s", (message) => {
      expectAllowed(message);
    });
  });

  describe("mixed English and Italian", () => {
    it.each([
      "stupido fuck coglione",
      "fuck coglione",
      "questo sito è shit",
      "the navigation è una merda",
      "che schifo this navigation",
      "fuck, il menu è lento",
      "il design è slow e stupid",
      "questo sito fa schifo and the nav is shit",
      "cazzo, the carousel is broken",
      "this is stupido",
      "ti odio, this design is bad",
      "porco dio this navigation is slow",
    ])("refuses: %s", (message) => {
      expectRefused(message);
    });

    it.each([
      "la navigation è slow ma il contrasto è terrible",
      "the menu è confusing e il layout è poorly designed",
    ])("allows strong criticism in two languages: %s", (message) => {
      expectAllowed(message);
    });
  });

  /* A message made of nothing but insults is not feedback either, and it is
     refused like any other prohibited language. */
  describe("messages made only of insults", () => {
    it.each([
      "stupido fuck coglione",
      "fuck coglione",
      "coglione stronzo",
      "stupid idiot",
      "fuck shit",
      "stupido stupido stupido stupido",
      "idiota cretino imbecille",
      "FUCK FUCK FUCK FUCK FUCK",
      "stupido, fuck, coglione!!!",
    ])("refuses: %s", (message) => {
      expectRefused(message);
    });
  });

  describe("the name field", () => {
    const CLEAN = "The layout is clear and easy to follow.";

    it.each([
      "shithead",
      "Dicks",
      "dickhead",
      "cocksucker",
      "troie",
      "kikes",
      "stupido",
      "Ti odio",
      "faggot",
      "You idiot",
      "fuck",
      "f*ck",
      "coglione",
      "Mr Stupid",
      "porco dio",
    ])("refuses prohibited language in a name: %s", (name) => {
      expectRefused(CLEAN, name);
    });

    it("refuses abuse in the name as well as the message, whichever comes first", () => {
      expectRefused("fuck you", "Andrea");
      expectRefused(CLEAN, "fuck you");
      expectBlocked(CLEAN, "slur", "faggot");
      expectBlocked(CLEAN, "threat", "I will kill you");
    });

    /* These five are real first names or surnames. They are ignored in `name`
       only, in exactly this spelling. */
    it.each(["Dick Smith", "Dick", "Troia", "Kike", "Fanny", "Cock"])(
      "allows the real name '%s'",
      (name) => {
        expectAllowed(CLEAN, name);
      },
    );

    it("does not let the name-safe words leak into a message", () => {
      expectProfanity("my cat is called Dick and he likes the site");
      expectProfanity("Troia is a nice little city");
      expectBlocked("Kike is a nice name", "slur");
      expectProfanity("the cock on the weather vane");
      expectProfanity("Fanny is my sister");
    });

    it("does not let a name-safe word excuse the rest of the field", () => {
      expectRefused(CLEAN, "Dick fuck");
      expectRefused(CLEAN, "Troia coglione");
      expectRefused(CLEAN, "Dick Smith, ti odio");
    });

    /* A compound insult is not a name even when one half is. */
    it.each([
      "Dick Head",
      "dick head",
      "DICK HEAD",
      "Dick-Head",
      "Dick  Head",
      "Dick. Head",
      "Dick Heads",
      "Dick Face",
      "Dick Wad",
      "Dick Bag",
      "Dick Hole",
      "Dick Sucker",
      "Dick Brain",
      "Dick Breath",
      "Cock Sucker",
      "Cock Head",
      "Cock Face",
      "Dickhead",
      "Dick H3ad",
      "Dick Heaaad",
      "D i c k  H e a d",
      "d.i.c.k h.e.a.d",
      "D*ck Head",
      "Prick Head",
    ])("refuses the compound insult '%s' in a name", (name) => {
      expectRefused(CLEAN, name);
    });

    it.each([
      "Dick Headley",
      "Dick Wadsworth",
      "Dick Bagley",
      "Dick Holder",
      "Dick Smith-Head",
      "Dick Van Dyke",
      "Fanny Pack",
      "Cock Robin",
      "Troia Costa",
    ])("still allows the real name '%s'", (name) => {
      expectAllowed(CLEAN, name);
    });

    it("allows ordinary names", () => {
      for (const name of [
        "Andrea Agostini",
        "María-José O’Neill",
        "Anne-Marie",
        "Cazzola",
        "Dickens",
        "Scunthorpe",
        "李雷",
        "Søren Kierkegaard",
      ]) {
        expectAllowed(CLEAN, name);
      }
    });

    it("lets a prohibited message through no clean name", () => {
      expectProfanity("fuck, this looks amazing", "Andrea");
    });
  });

  /* An exception covers its own words and nothing else. Whatever is left of
     the field after the exception is still judged in full, in every spelling. */
  describe("exceptions never excuse another insult in the same field", () => {
    const CLEAN = "The layout is clear and easy to follow.";

    it.each([
      ["a plain insult", "idiot-proof, you idiot"],
      ["a plain insult", "this is idiot-proof and stupid"],
      ["a masked insult", "idiot-proof st*pid"],
      ["a masked insult", "idiot-proof f*ck"],
      ["a spaced insult", "idiot-proof s t u p i d"],
      ["a spaced insult", "idiot-proof f u c k"],
      ["a repeated-letter insult", "idiot-proof stuuuupid"],
      ["a leetspeak insult", "idiot-proof 5tup1d"],
      ["an Italian insult", "idiot-proof, che stronzo"],
      ["a threat", "idiot-proof, I will kill you"],
      ["a spelled-out exception", "i d i o t - p r o o f you idiot"],
      ["a plain insult", "a dumb component, you idiot"],
      ["a plain insult", "a dumb terminal, fuck"],
      ["a masked insult", "dumb UI and st*pid"],
      ["a spaced insult", "dumb widget, c o g l i o n e"],
      ["a second exception", "idiot-proof dumb component you idiot"],
      ["a plain insult", "spic and span, you idiot"],
      ["a masked insult", "spic and span f*ck"],
      ["a slur", "spic and span faggot"],
      ["a plain insult", "Jesus Christ, you idiot"],
      ["a masked insult", "Jesus Christ st*pid"],
      ["a spaced insult", "Jesus Christ s t u p i d"],
      ["a plain insult", "how do I suck the colour out? you idiot"],
      ["a masked insult", "suck up the water, st*pid"],
      ["a spaced insult", "suck dry the cache s t u p i d"],
      ["a repeated-letter insult", "suck the colour out, stuuupid"],
      ["the colloquial verb", "suck up the water. this sucks"],
    ])("still refuses %s next to an exception: %s", (_label, message) => {
      expectRefused(message);
    });

    it.each([
      ["a plain insult", "Dick idiot"],
      ["a plain insult", "Dick, you idiot"],
      ["a masked insult", "Dick st*pid"],
      ["a masked insult", "Dick f*ck"],
      ["a spaced insult", "Dick f u c k"],
      ["a spaced insult", "Dick s t u p i d"],
      ["a repeated-letter insult", "Dick stuuupid"],
      ["a leetspeak insult", "Dick 5tup1d"],
      ["an Italian insult", "Dick coglione"],
      ["a slur", "Dick faggot"],
      ["a plain insult", "Kike stupid"],
      ["a masked insult", "Kike st*pid"],
      ["a spaced insult", "Kike c o g l i o n e"],
      ["a plain insult", "Fanny puttana"],
      ["a masked insult", "Fanny f*ck"],
      ["a plain insult", "Troia vaffanculo"],
      ["a masked insult", "Cock sh*t"],
      ["a threat", "Dick Smith, I will kill you"],
      ["hostility", "Fanny, I hate you with a passion"],
    ])(
      "still refuses %s next to a name-safe word in a name: %s",
      (_l, name) => {
        expectRefused(CLEAN, name);
      },
    );

    it("keeps the exceptions themselves", () => {
      expectAllowed("The new form is idiot-proof and clear.");
      expectAllowed("A dumb component is fine for presentation only.");
      expectAllowed("The footer is spic and span.");
      expectAllowed("Jesus Christ Superstar is in my playlist");
      expectAllowed("the pump will suck up the water");
      expectAllowed(CLEAN, "Dick Smith");
    });
  });

  /* Spaced-out letters: every stretch of three or more letters inside a run is
     read as a word, so a neighbouring one-letter word ("a", "e", "i", "o",
     "y") cannot hide it. */
  describe("spaced and masked words", () => {
    it.each([
      "il menu è s t u p i d o e lento",
      "il menu è s t u p i d o",
      "il menu e s t u p i d o e lento",
      "a e s t u p i d o a e",
      "i f u c k i n g",
      "this is a s t u p i d design",
      "this is s t u p i d a design",
      "the menu is a s h i t",
      "e c o g l i o n e",
      "il sito è o c a z z o",
      "è s t r o n z o",
      "a i d i o t",
      "y o u i d i o t",
      "the nav is s_h_i_t",
      "the nav is s.h.i.t.",
      "the nav is s-h-i-t",
      "the nav is s*h*i*t",
      "the nav is S H I T",
      "the nav is s  h  i  t",
      "the nav is  b i t c h  and slow",
      "m o t h e r f u c k e r",
      "c a g a r e",
      "v a f f a n c u l o",
    ])("refuses a spaced-out word: %s", (message) => {
      expectRefused(message);
    });

    it.each([
      "I use a b c and d e f for the labels",
      "Plan A B C D is in the roadmap",
      "Press the arrow keys: w a s d",
      "the grid goes a b c d e f g h",
      "S P A C E D  O U T headings look nice",
      "i o u",
      "Q & A, R&D and A/B tests",
      "the u s a office, a p i docs",
    ])("does not mistake spaced initials for a word: %s", (message) => {
      expectAllowed(message);
    });

    it.each([
      "this is st*pid",
      "this is st#pid",
      "this is st_pid",
      "this is st%pid",
      "this is st&pid",
      "this is st~pid",
      "this is st^pid",
      "f_ck",
      "sh%t",
      "fu*king",
      "fu**ing",
      "f**king",
      "f***ing",
      "f*cker",
      "f*ckers",
      "f*cked",
      "m*therf*cker",
      "m*****f*****",
      "bull*hit",
      "b*tch",
      "b*tches",
      "b*stard",
      "a**hole",
      "d*ckhead",
      "d*ck",
      "c*ck",
      "p*ssy",
      "wh*re",
      "sl*t",
      "tw*t",
      "cr*p",
      "d*mn",
      "m*ron",
      "r*tard",
      "id*ot",
      "dumb*ss",
      "c*zzo",
      "c*zzi",
      "c*zzata",
      "m*rda",
      "str*nzo",
      "str*nza",
      "str*nzi",
      "str*nzata",
      "p*ttana",
      "c*glione",
      "c*glioni",
      "vaff*nculo",
      "m*nchia",
      "f*ga",
      "c*lo",
      "tr*ia",
      "st*pida",
      "id*ota",
      "cr*tino",
      "sc*mo",
      "imb*cille",
      "defic*ente",
    ])("refuses a masked word: %s", (word) => {
      expectRefused(`the loading is ${word} and slow`);
    });

    it.each(["n*gger", "n#gger", "n_gga", "f*ggot", "fr*cio", "r*cchione"])(
      "refuses a masked slur: %s",
      (word) => {
        expectBlocked(`the loading is ${word}`, "slur");
      },
    );

    it.each([
      "R&D costs 5* more",
      "snake_case names",
      "the footnote* is wrong",
      "a*b*c is a pattern",
      "Q&A about the 3*4 grid",
      "use ** for bold and * for lists",
      "word_count and char_count",
      "AT&T and P&L pages",
      "5#1 and 3*3",
      "c#, f# and the c++ docs",
      "the ~ and ^ keys",
      "100% done, 50% left",
    ])("does not read ordinary symbols as a mask: %s", (message) => {
      expectAllowed(message);
    });

    it("stays fast on a very long run of spaced letters", () => {
      const started = Date.now();
      const text =
        "a b c d e f g h i j k l m n o p q r s t u v w x y z ".repeat(90);
      moderateFeedback({ message: text });
      expect(Date.now() - started).toBeLessThan(1000);
    });
  });

  /* The word list. Every person-insult noun is refused on its own, wherever it
     sits, and so is the rest of the everyday vocabulary. */
  describe("the wider vocabulary", () => {
    it.each([
      "dumbfuck",
      "dumbass",
      "jackass",
      "smartass",
      "asshole",
      "arsehole",
      "dickhead",
      "douchebag",
      "shithead",
      "shitbag",
      "scumbag",
      "motherfucker",
      "fuckface",
      "fuckhead",
      "fucktard",
      "cunt",
      "twat",
      "prick",
      "tosser",
      "wanker",
      "bitch",
      "bastard",
      "moron",
      "idiot",
      "imbecile",
      "cretin",
      "retard",
      "dipshit",
      "assclown",
      "arsewipe",
      "dimwit",
      "nitwit",
      "halfwit",
      "numbskull",
      "airhead",
      "birdbrain",
      "blockhead",
      "buffoon",
      "dunce",
      "simpleton",
      "lowlife",
      "dirtbag",
      "sleazebag",
      "loser",
    ])(
      "refuses the person-insult '%s' on its own and in a sentence",
      (word) => {
        expectRefused(word);
        expectRefused(`the ${word} who built this`);
        expectRefused(`this was made by a ${word}`);
        expectRefused(`${word.toUpperCase()}!`);
      },
    );

    it.each([
      "shite",
      "bullcrap",
      "horsecrap",
      "dammit",
      "bollox",
      "bollocks",
      "mofo",
      "fukin",
      "fuckin",
      "effing",
      "biatch",
      "beotch",
      "bytch",
      "wtf",
      "stfu",
      "gtfo",
      "fml",
      "omfg",
      "pussy",
      "tits",
      "titties",
      "dickwad",
      "cocksucker",
      "jerkoff",
      "bellend",
      "skank",
      "slutty",
      "whore",
      "buggers",
    ])("refuses the English word '%s'", (word) => {
      expectRefused(`the page is ${word} on mobile`);
      expectRefused(word);
    });

    it.each([
      "spic",
      "wop",
      "beaner",
      "honky",
      "honkey",
      "shemale",
      "spaz",
      "spazz",
      "spastic",
      "kikes",
    ])("refuses the slur '%s'", (word) => {
      expectBlocked(`the site is ${word}`, "slur");
    });

    it.each([
      "fica",
      "fregna",
      "fregnaccia",
      "inculare",
      "inculato",
      "rompipalle",
      "rompiballe",
      "rompicazzo",
      "pompino",
      "pompinara",
      "sborra",
      "sborrata",
      "segaiolo",
      "chiavata",
      "sfigato",
      "sfigata",
      "porcata",
      "porcheria",
      "schifezza",
      "schifezze",
      "cagata",
      "cagare",
      "pirla",
      "baldracca",
      "scassacazzo",
      "troiata",
      "stronzata",
      "minchiate",
      "coglionaggine",
      "mignotta",
      "zoccola",
    ])("refuses the Italian word '%s'", (word) => {
      expectRefused(`il sito è ${word}`);
      expectRefused(word);
    });

    it.each([
      "deficiente",
      "deficente",
      "defficiente",
      "demente",
      "ebete",
      "babbeo",
      "scimunito",
      "rimbambito",
      "decerebrato",
      "cretinata",
      "stupidata",
      "rincoglionito",
      "idiozia",
      "imbecillità",
      "scemo",
      "scema",
      "cretino",
    ])("refuses the Italian insult '%s'", (word) => {
      expectRefused(`il sito è ${word}`);
      expectRefused(word);
    });

    it.each([
      "shut up",
      "Shut up!",
      "shut your mouth",
      "shut your trap",
      "go to hell",
      "burn in hell",
      "rot in hell",
      "stai zitto",
      "sta zitta",
      "zitto tu",
      "chiudi la bocca",
      "chiudi il becco",
    ])("refuses the rude command '%s'", (phrase) => {
      expectProfanity(`the menu is slow, ${phrase}`);
    });

    it.each([
      "I shut the tab and went to the hell of the footer? no, to the help page",
      "He shut the laptop and the screen went dark",
      "the hellfire theme is dark",
      "stai attento al menu",
      "il bottone chiude la finestra",
      "ebbene sì, il sito va bene",
      "the dementia care page is clear",
      "I use a nitrogen sensor and a dimmer",
      "The simple tone and the dunes picture are nice",
      "the bird brain diagram in the docs",
    ])("does not refuse an ordinary neighbour: %s", (message) => {
      expectAllowed(message);
    });
  });

  /* Every disguise, applied to every base word, judged through
     moderateFeedback in BOTH fields: as a message, and as a name next to a clean
     message. Each case asserts the exact final verdict (action and reason).
     Forms that leave a word unchanged (leetspeak on "fuck") are skipped, so
     the plain word is never counted as a disguise. */
  describe("every disguise is refused in the message and in the name", () => {
    const CLEAN_MESSAGE = "The layout is clear and easy to follow.";
    const BASES: [string, "profanity" | "slur"][] = [
      ["fuck", "profanity"],
      ["shit", "profanity"],
      ["stupid", "profanity"],
      ["idiot", "profanity"],
      ["suck", "profanity"],
      ["cazzo", "profanity"],
      ["stronzo", "profanity"],
      ["coglione", "profanity"],
      ["faggot", "slur"],
    ];
    const LOOKALIKES: Record<string, string> = {
      a: String.fromCharCode(0x0430),
      e: String.fromCharCode(0x0435),
      o: String.fromCharCode(0x043e),
      p: String.fromCharCode(0x0440),
      c: String.fromCharCode(0x0441),
      x: String.fromCharCode(0x0445),
      y: String.fromCharCode(0x0443),
      i: String.fromCharCode(0x0456),
      s: String.fromCharCode(0x0455),
    };
    const ACCENTED: Record<string, string> = {
      a: "á",
      e: "é",
      i: "í",
      o: "ó",
      u: "ú",
    };
    const firstVowel = (w: string) => w.search(/[aeiou]/);
    const replaceFirstVowel = (w: string, by: string) => {
      const at = firstVowel(w);
      return w.slice(0, at) + by + w.slice(at + 1);
    };
    const FORMS: Record<string, (w: string) => string> = {
      "upper case": (w) => w.toUpperCase(),
      "mixed case": (w) =>
        [...w].map((c, i) => (i % 2 ? c.toUpperCase() : c)).join(""),
      leetspeak: (w) =>
        w
          .replace(/o/g, "0")
          .replace(/i/g, "1")
          .replace(/e/g, "3")
          .replace(/a/g, "4")
          .replace(/s/g, "5"),
      "a repeated vowel": (w) =>
        replaceFirstVowel(w, w[firstVowel(w)].repeat(4)),
      "a repeated last letter": (w) => w + w[w.length - 1].repeat(3),
      "spaced letters": (w) => [...w].join(" "),
      "dotted letters": (w) => [...w].join("."),
      "dashed letters": (w) => [...w].join("-"),
      "underscored letters": (w) => [...w].join("_"),
      "a * mask": (w) => replaceFirstVowel(w, "*"),
      "a # mask": (w) => replaceFirstVowel(w, "#"),
      "a _ mask": (w) => replaceFirstVowel(w, "_"),
      "a % mask": (w) => replaceFirstVowel(w, "%"),
      "full-width letters": (w) =>
        [...w]
          .map((c) => String.fromCharCode(c.charCodeAt(0) + 0xfee0))
          .join(""),
      "a zero-width space": (w) =>
        w.slice(0, 2) + ZERO_WIDTH_SPACE + w.slice(2),
      "a soft hyphen": (w) => w.slice(0, 2) + SOFT_HYPHEN + w.slice(2),
      "Cyrillic look-alikes": (w) =>
        [...w].map((c) => LOOKALIKES[c] ?? c).join(""),
      accents: (w) => replaceFirstVowel(w, ACCENTED[w[firstVowel(w)]]),
    };

    const CASES = BASES.flatMap(([word, reason]) =>
      Object.entries(FORMS)
        .map(([form, apply]): [string, string, string, string] => [
          word,
          form,
          apply(word),
          reason,
        ])
        .filter(([, , disguised]) => disguised !== word),
    );

    it("has a disguise for every base word", () => {
      expect(CASES.length).toBeGreaterThan(BASES.length * 14);
    });

    it.each(CASES)(
      "%s written with %s is refused as a message",
      (_word, _form, disguised, reason) => {
        expect(verdict(`the menu is ${disguised} and slow`)).toEqual({
          action: "block",
          reason,
        });
      },
    );

    it.each(CASES)(
      "%s written with %s is refused as a name",
      (_word, _form, disguised, reason) => {
        expect(verdict(CLEAN_MESSAGE, disguised)).toEqual({
          action: "block",
          reason,
        });
      },
    );

    /* Single-letter words next to a spaced-out word ("a", "e", "i", "o", "u",
       "y") must not hide it. */
    it.each(
      BASES.flatMap(([word, reason]) =>
        ["a", "e", "i", "o", "u", "y", "a e"].flatMap((stray) => [
          [word, `${stray} ${[...word].join(" ")}`, reason],
          [word, `${[...word].join(" ")} ${stray}`, reason],
          [word, `${stray} ${[...word].join(" ")} ${stray}`, reason],
        ]),
      ),
    )(
      "%s spaced out next to single letters is refused: %s",
      (_w, text, reason) => {
        expect(verdict(`the menu is ${text} slow`)).toEqual({
          action: "block",
          reason,
        });
        expect(verdict(CLEAN_MESSAGE, text)).toEqual({
          action: "block",
          reason,
        });
      },
    );
  });

  /* "suck" has a literal use and a vulgar one. The exception covers the
     literal use only, in plain letters, and the vulgar use is refused in every
     disguise. */
  describe("the literal verb 'suck' is a narrow exception", () => {
    it.each([
      "go suck off",
      "suck off",
      "this sucks",
      "this s u c k s",
      "this s-u-c-k-s",
      "this s.u.c.k.s",
      "this s*cks",
      "this s#cks",
      "this su*ks",
      "this 5ucks",
      "this suuuucks",
      "this SUCKS",
      `this ${String.fromCharCode(0x0455)}ucks`,
      "you s u c k",
      "you s*ck",
      "a s u c k a",
    ])("refuses the vulgar verb in any disguise: %s", (message) => {
      expectRefused(message);
      expectRefused("The layout is clear.", message);
    });

    it.each([
      "suck up the water",
      "suck the colour out of this image",
      "the vacuum sucks the dust off the keys",
    ])("allows the literal verb in plain letters: %s", (message) => {
      expectAllowed(message);
    });

    it.each([
      "suck up the water, you idiot",
      "suck up the water. This sucks",
      "suck up the water and f*ck the rest",
      "suck up the water s t u p i d",
      "suck up the water, stuuupid",
      "suck the dust off the keys, ti odio",
      "suck the colour out, I hate you with a passion",
      "suck dry the cache, st*pido",
      "suck dry the cache, c o g l i o n e",
      "suck up the water, go suck off",
      "suck the water out, s u c k s",
      "suck up the water, this sucks the loading is slow",
    ])("never lets the literal verb excuse something else: %s", (message) => {
      expectRefused(message);
      expectRefused("The layout is clear.", message);
    });
  });

  /* Name-safe words are real names ("Dick", "Cock", "Fanny", "Troia", "Kike").
     ONE plain occurrence is ignored in `name`, nowhere else, and only when it
     is written plainly. */
  describe("name-safe words are a narrow exception", () => {
    const CLEAN_MESSAGE = "The layout is clear and easy to follow.";

    it.each([
      "Dick",
      "Cock",
      "Fanny",
      "Troia",
      "Kike",
      "Dick Smith",
      "Andrea Troia",
      "Fanny Brice",
      "Cock Robin",
      "Kike Hernández",
      "dick",
      "DICK",
    ])("allows one plain occurrence in a name: %s", (name) => {
      expect(verdict(CLEAN_MESSAGE, name)).toEqual({ action: "allow" });
    });

    it.each([
      "Dick",
      "Cock",
      "Fanny",
      "Troia",
      "Kike",
      "Dick Smith",
      "Andrea Troia",
    ])("refuses the same words in a message: %s", (message) => {
      expectRefused(message);
      expectRefused(`my name is ${message} and the site is slow`);
    });

    it.each([
      ["leetspeak", "D1ck"],
      ["leetspeak", "C0ck"],
      ["leetspeak", "Tr0ia"],
      ["leetspeak", "K1ke"],
      ["spaced letters", "d i c k"],
      ["spaced letters", "D I C K Smith"],
      ["spaced letters", "k i k e"],
      ["dotted letters", "D.i.c.k"],
      ["dotted letters", "T.r.o.i.a"],
      ["dashed letters", "F-a-n-n-y"],
      ["a repeated letter", "Dickkk"],
      ["a repeated letter", "Fannyyy"],
      ["a repeated letter", "Kikeee"],
      ["a mask", "D*ck"],
      ["a mask", "C*ck"],
      ["a mask", "Tr*ia"],
    ])("refuses %s in a name: %s", (_label, name) => {
      expect(verdict(CLEAN_MESSAGE, name).action).toBe("block");
    });

    /* Normalisation is not a disguise: full-width letters, an accent or an
       invisible character leave the same plain name, which is still ONE
       occurrence of that name. Nothing else can hide in it. */
    it.each([
      "\uff24\uff49\uff43\uff4b",
      "D\u00edck",
      `Di${ZERO_WIDTH_SPACE}ck`,
      `Di${SOFT_HYPHEN}ck Smith`,
      `D${CYRILLIC_I}ck`,
      `T${CYRILLIC_R}oia`,
    ])("reads the same name through normalisation: %s", (name) => {
      expect(verdict(CLEAN_MESSAGE, name)).toEqual({ action: "allow" });
    });

    it.each([
      "Dick Dick",
      "Cock Cock",
      "Dick Cock",
      "Fanny Troia",
      "Dick Smith Dick",
      "Dick, Fanny",
      "Kike Troia",
      "Dick D1ck",
      "Dick d i c k",
      "Dick D*ck",
      "Troia Troia",
      "Dick2",
      `D${CYRILLIC_I}ck Dick`,
    ])("allows only ONE plain name-safe word per name: %s", (name) => {
      expect(verdict(CLEAN_MESSAGE, name).action).toBe("block");
    });

    it.each([
      "Dick Head",
      "Dick Heads",
      "Cock Sucker",
      "Big Dick",
      "Huge Cock",
      "Hard Cock",
      "Tiny Dick",
      "Dick Pic",
      "Dick Pics",
      "Dick Size",
      "Cock Ring",
      "Dick Monster",
      "Dick Joke",
      "Dick Face",
    ])("refuses an innuendo built on a name-safe word: %s", (name) => {
      expect(verdict(CLEAN_MESSAGE, name).action).toBe("block");
    });

    it.each([
      "Dick Smith",
      "Dick Headley",
      "Dick Hollander",
      "Dick Bagley",
      "Dickinson",
      "Dickens",
      "Cockburn",
      "Hancock",
      "Peacock",
      "Fanny Pack",
      "Big Troia",
      "Hot Dickson",
    ])("still allows a real name next to such words: %s", (name) => {
      expect(verdict(CLEAN_MESSAGE, name)).toEqual({ action: "allow" });
    });

    it.each([
      "Dick, I will kill you",
      "Dick Smith, ti odio",
      "Troia, vaffanculo",
      "Fanny, f*ck",
      "Kike stupid",
      "Kike, faggot",
      "Cock, f u c k",
      "Dick, I hate you with a passion",
      "Dick https://a.com/x https://b.com/y https://c.com/z https://d.com/w",
    ])(
      "refuses anything else prohibited next to a name-safe word: %s",
      (name) => {
        expect(verdict(CLEAN_MESSAGE, name).action).toBe("block");
      },
    );

    it("applies the rules of the message even when the name is a safe word", () => {
      expect(verdict("fuck, this looks amazing", "Dick")).toEqual({
        action: "block",
        reason: "profanity",
      });
      expect(verdict("you idiot", "Troia")).toEqual({
        action: "block",
        reason: "directed_abuse",
      });
    });
  });

  /* The text exceptions (idiot-proof, dumb component, spic and span, Jesus
     Christ): each covers its own words and nothing else, in any disguise,
     in both fields. */
  describe("text exceptions never hide something else", () => {
    const CLEAN_MESSAGE = "The layout is clear and easy to follow.";
    const EXCEPTIONS = [
      "idiot-proof",
      "idiot proof",
      "idiot-proofed",
      "dumb component",
      "dumb terminal",
      "dumb UI",
      "spic and span",
      "Jesus Christ",
    ];
    const PROHIBITED_BITS: [string, string][] = [
      ["a plain insult", "you idiot"],
      ["a profanity", "fuck"],
      ["a masked word", "f*ck"],
      ["a spaced word", "s t u p i d"],
      ["a repeated word", "stuuupid"],
      ["a leetspeak word", "5tup1d"],
      ["an Italian word", "coglione"],
      ["a masked Italian word", "c*glione"],
      ["a spaced Italian word", "c o g l i o n e"],
      ["a slur", "faggot"],
      ["a masked slur", "f*ggot"],
      ["a threat", "I will kill you"],
      ["hostility", "I hate you with a passion"],
      ["the colloquial verb", "this sucks"],
      ["the vulgar verb, spaced", "s u c k s"],
      ["a blasphemy", "porco dio"],
    ];
    /* A name-safe word is only an exception in `name`, so it is tested as a
       prohibited word in a message, never as a name. */
    const IN_MESSAGE_ONLY = "Dick";

    const CASES = EXCEPTIONS.flatMap((exception) =>
      PROHIBITED_BITS.flatMap(([label, bit]): [string, string, string][] => [
        [exception, label, `${exception} ${bit}`],
        [exception, label, `${bit} ${exception}`],
        [exception, label, `${exception}, ${bit}`],
        [exception, label, `${bit}. ${exception}.`],
      ]),
    );

    it.each(CASES)(
      "'%s' next to %s is refused as a message: %s",
      (_exception, _label, text) => {
        expect(verdict(text).action).toBe("block");
      },
    );

    it.each(CASES)(
      "'%s' next to %s is refused as a name: %s",
      (_exception, _label, text) => {
        expect(verdict(CLEAN_MESSAGE, text).action).toBe("block");
      },
    );

    it.each(EXCEPTIONS)(
      "'%s' does not excuse a name-safe word in a message",
      (exception) => {
        expectRefused(`${exception} ${IN_MESSAGE_ONLY}`);
        expectRefused(`${IN_MESSAGE_ONLY}, ${exception}`);
      },
    );

    it.each(EXCEPTIONS)(
      "'%s' does not excuse a second name-safe word in a name",
      (exception) => {
        expect(verdict(CLEAN_MESSAGE, `Dick ${exception} Dick`).action).toBe(
          "block",
        );
      },
    );

    it("keeps the exceptions on their own", () => {
      for (const exception of EXCEPTIONS) {
        expect(verdict(`The form is ${exception}, thanks`)).toEqual({
          action: "allow",
        });
      }
    });

    it("only covers the exact phrases", () => {
      expectRefused("this is idiotproofing, you idiot");
      expectRefused("a dumb person");
      expectRefused("a dumb button");
      expectRefused("dumb as a component");
      expectRefused("1diot-proof");
      expectRefused("i d i o t - p r o o f");
      expectRefused("idiot-pr0of");
    });
  });

  describe("benign substrings, names and technical terms", () => {
    it.each([
      // words that contain a rude word
      "Scunthorpe, Essex and Sussex are on my route",
      "The class assignment and the bass guitar tab were great",
      "assess the assets, then pass the mass",
      "the cockpit, the peacock and the cocktail menu",
      "Dickens would have loved the typography",
      "analytics and documentation are clear",
      "Montenegro and Niger are nice places",
      "shiitake mushrooms and the Arsenal stadium on the map",
      "Hancock and Cockburn are in the credits",
      "Il cognome Cazzola e il comune di Cazzago sono nel footer",
      "la cazzuola del muratore nell'illustrazione",
      "spaghetti alla puttanesca nella pagina del menu",
      "la figura e i circoli culturali",
      "la parola finocchio indica il fennel",
      // words that are only sometimes rude: not on any list
      "a chink in the armour of the form validation",
      "my Maine Coon likes the dark mode",
      "el texto negro sobre fondo blanco se lee bien",
      "a sea dyke next to the Dutch map",
      // technical language
      "kill the autoplay video, kill -9 the process, abort the request",
      "the child process was killed and the die() call never returns",
      "SELECT * FROM users WHERE id = 5*3; k8s, h264, mp4, C++ and 100%",
      "Web3, 3D, 4K and 24/7 support; v2.0! for $100 at #1 @andrea",
      "master branch, execute the build, and the hell-bent scroll",
    ])("allows: %s", (message) => {
      expectAllowed(message);
    });

    it.each([
      "This will kill your SEO and your bounce rate",
      "I could kill for a dark mode option",
      "I'll shoot you an email with the screenshots",
      "I will find you a better icon set",
      "please don't kill yourself over the deadline",
    ])("does not mistake an idiom for a threat: %s", (message) => {
      expectAllowed(message);
    });

    /* Intentional consequences of the strict policy, written down so nobody
       mistakes them for bugs. */
    it.each([
      ["a technical use of 'retard'", "The spark retard setting looks wrong"],
      ["'stupid' as an intensifier", "the setup is stupid simple"],
      ["a city called Troia", "the Troia ruins are in the photo"],
      ["'deficiente' as 'lacking'", "accessibilità deficiente"],
    ])("refuses %s", (_label, message) => {
      expectRefused(message);
    });
  });

  describe("strong criticism without prohibited language", () => {
    it.each([
      "easily vibecoded in 5 mins, it looks like ai slop and im sick of it, at least put in some effort",
      "This looks like AI slop. Honestly the whole thing feels generic.",
      "The navigation is confusing, the contrast is terrible and the hero is garbage.",
      "The page is a disaster on mobile and the animation makes me dizzy.",
      "I hate the carousel; it kills performance and it is useless.",
      "Very poor effort on the accessibility side, nothing works with a keyboard.",
      "This is disgusting, awful and worthless work. I want my time back.",
      "I hate this navigation",
      "I really dislike this carousel and the scroll hijacking",
      "Il design è brutto, il sito è lento e il menu è inutilizzabile.",
      "Che delusione: mi aspettavo molto di più da un portfolio.",
      "Il sito è orribile, pessimo e inaccettabile.",
    ])("allows: %s", (message) => {
      expectAllowed(message);
    });
  });

  describe("link spam", () => {
    const TEXT = "Here is what I mean about the pricing page layout:";

    it("allows a single legitimate link, with or without a scheme", () => {
      expectAllowed(`${TEXT} https://example.com/screenshots/pricing.png`);
      expectAllowed(`${TEXT} www.example.com/pricing`);
      expectAllowed(`${TEXT} example.com/pricing`);
    });

    it(`allows up to ${MAX_LINKS_IN_MESSAGE} links around real text`, () => {
      expectAllowed(
        `${TEXT} compare stripe.com, linear.app and https://vercel.com/pricing`,
      );
    });

    it("does not count an e-mail address or a file name as a link", () => {
      expectAllowed(`${TEXT} write to me at jane.doe@example.com, thanks`);
      expectAllowed(`${TEXT} the index.html and next.config.js files`);
    });

    it("blocks a pile of links", () => {
      expectBlocked(`${TEXT} a.com/x b.com/y c.com/z d.com/w`, "link_spam");
    });

    it("blocks two links with almost no text around them", () => {
      expectBlocked(
        "see https://example.com and https://example.org please",
        "link_spam",
      );
    });

    it("blocks the same link repeated", () => {
      expectBlocked(
        `${TEXT} https://example.com/a https://example.com/a https://example.com/a`,
        "link_spam",
      );
    });

    it("blocks a link in the name, where no link belongs", () => {
      expectBlocked(TEXT, "link_spam", "Free stuff at https://example.com");
      expectBlocked(TEXT, "link_spam", "www.example.com");
    });
  });

  describe("malformed and hostile input", () => {
    it("ignores anything that is not a non-empty string", () => {
      expect(moderateFeedback({})).toEqual({ action: "allow" });
      expect(moderateFeedback({ message: undefined, name: null })).toEqual({
        action: "allow",
      });
      expect(moderateFeedback({ message: 42, name: {} })).toEqual({
        action: "allow",
      });
      expect(moderateFeedback({ message: ["fuck you"] })).toEqual({
        action: "allow",
      });
      expect(moderateFeedback({ message: "   ", name: "" })).toEqual({
        action: "allow",
      });
      expect(
        moderateFeedback(undefined as unknown as { message?: unknown }),
      ).toEqual({ action: "allow" });
      expect(
        moderateFeedback(null as unknown as { message?: unknown }),
      ).toEqual({ action: "allow" });
    });

    it("survives odd characters without throwing", () => {
      const lone = String.fromCharCode(0xd800);
      for (const text of [
        `${lone} shit ${lone}`,
        "😀😀😀 great site 😀",
        "\u0000\u0007 control \u001b[31m characters",
        "((((([[[[{{{{ ^$.*+?|\\ regex characters",
        "مرحبا — النص من اليمين إلى اليسار",
        "สวัสดี เว็บไซต์สวยมาก",
        "a".repeat(2000),
      ]) {
        expect(() =>
          moderateFeedback({ message: text, name: text }),
        ).not.toThrow();
      }
    });

    it("stays fast on very long and adversarial input", () => {
      const started = Date.now();
      moderateFeedback({ message: "a.".repeat(50_000) });
      moderateFeedback({ message: "f u ".repeat(50_000) });
      moderateFeedback({ message: "a".repeat(200_000) });
      moderateFeedback({ message: "word ".repeat(50_000) });
      expect(Date.now() - started).toBeLessThan(2000);
    });

    it("only reads the start of an enormous field", () => {
      const padding = "x ".repeat(10_000);
      expectAllowed(`${padding}fuck you`);
    });

    it("never returns, echoes or retains the text it judged", () => {
      const text = "u dumbfuck, i will kill you";
      const result = JSON.stringify(verdict(text));
      expect(result).not.toContain("dumbfuck");
      expect(result).not.toContain("kill");
    });
  });
});

describe("normalizeForModeration", () => {
  it("folds full-width and accented letters and lowercases", () => {
    expect(normalizeForModeration("ＦＵＣＫ")).toBe("fuck");
    expect(normalizeForModeration("Càzzò Ünï")).toBe("cazzo uni");
  });

  it("removes invisible characters and collapses whitespace", () => {
    expect(
      normalizeForModeration(`a${ZERO_WIDTH_SPACE}b${SOFT_HYPHEN}c\n\n\t d`),
    ).toBe("abc d");
  });

  it("maps look-alike letters from other scripts to Latin", () => {
    expect(normalizeForModeration(`${CYRILLIC_A}b${CYRILLIC_O}`)).toBe("abo");
  });

  it("drops apostrophes so contractions read as one word", () => {
    expect(normalizeForModeration("I'll don’t")).toBe("ill dont");
  });

  it("caps how much it will look at", () => {
    expect(normalizeForModeration("a".repeat(100_000)).length).toBeLessThan(
      10_000,
    );
  });
});
