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

const verdict = (message: string, name?: string) =>
  moderateFeedback({ message, name });

const expectAllowed = (message: string, name?: string) =>
  expect(verdict(message, name)).toEqual({ action: "allow" });

const expectBlocked = (message: string, reason: string, name?: string) =>
  expect(verdict(message, name)).toEqual({ action: "block", reason });

const expectFlagged = (message: string, name?: string) =>
  expect(verdict(message, name).action).toBe("flag");

describe("moderateFeedback", () => {
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

    /* Modifiers and addressees after "you" do not turn the insult into
       feedback, but a verb does: there "you" starts a new clause. */
    it("keeps the run-on reading of 'I hate you <verb>' as feedback", () => {
      expectAllowed("I hate you have to scroll to find the prices");
      expectAllowed("I hate you need to log in just to read the page");
      expectAllowed("I hate you can't search by tag");
      expectAllowed("I hate this navigation");
      expectAllowed("I don't hate you, the navigation is the problem");
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
    ])("still flags profanity written with %s", (_label, text) => {
      expectFlagged(`the loading is ${text}`);
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

  describe("profanity that is not abuse is flagged, never blocked", () => {
    it.each([
      "The contrast is shit and the nav is slow.",
      "what the fuck is this navigation",
      "this is bullshit, the menu never opens",
      "the hero animation is fucking slow",
      "damn, the page jumps around on mobile",
      "Questa pagina è una merda, il caricamento è lento",
      "cazzo, il menu non si apre su mobile",
      "che cazzata il carosello",
      "madonna puttana quanto è lento",
    ])("flags: %s", (message) => {
      expect(verdict(message)).toEqual({
        action: "flag",
        reasons: ["profanity"],
      });
    });

    it("flags, rather than blocks, a profane verdict on the work itself", () => {
      expectFlagged("thanks to this stack the site is a piece of shit");
      expectFlagged("this site is a piece of shit and it loads slowly");
    });

    it("flags an ambiguous term in a message so a person decides", () => {
      expect(
        verdict("The spark retard setting on the demo looks wrong"),
      ).toEqual({ action: "flag", reasons: ["ambiguous_term"] });
    });

    it("never turns a flag into an allow or a block", () => {
      const result = verdict("this checkout flow is shit, fix it please");
      expect(result.action).toBe("flag");
      expect(result).not.toHaveProperty("reason");
    });
  });

  describe("benign text is left alone", () => {
    it.each([
      // words that contain a rude word
      "Scunthorpe, Essex and Sussex are on my route",
      "The class assignment and the bass guitar tab were great",
      "assess the assets, then pass the mass",
      "the cockpit, the peacock and the cocktail menu",
      "Dickens would have loved the typography",
      "analytics and documentation are clear",
      "Montenegro and Niger are nice places",
      "Il cognome Cazzola e il comune di Cazzago sono nel footer",
      "la parola finocchio indica il fennel",
      // words that are only sometimes rude
      "a chink in the armour of the form validation",
      "my Maine Coon likes the dark mode",
      "el texto negro sobre fondo blanco se lee bien",
      "a sea dyke next to the Dutch map",
      // technical language
      "kill the autoplay video, kill -9 the process, abort the request",
      "the child process was killed and the die() call never returns",
      "SELECT * FROM users WHERE id = 5*3; k8s, h264, mp4, C++ and 100%",
      "Web3, 3D, 4K and 24/7 support; v2.0! for $100 at #1 @andrea",
    ])("allows: %s", (message) => {
      expectAllowed(message);
    });

    it.each([
      "This will kill your SEO and your bounce rate",
      "I could kill for a dark mode option",
      "I'll shoot you an email with the screenshots",
      "I will find you a better icon set",
      "please don't kill yourself over the deadline",
      "I felt like an idiot when I could not find the menu",
      "you are not an idiot, the form is just confusing",
      "make the checkout idiot-proof, you will thank yourself",
      "you idiot-proofed the form nicely",
    ])("does not mistake an idiom for abuse: %s", (message) => {
      expectAllowed(message);
    });

    it.each([
      "easily vibecoded in 5 mins, it looks like ai slop and im sick of it, at least put in some effort",
      "This looks like AI slop. Honestly the whole thing feels generic.",
      "The navigation is confusing, the contrast is terrible and the hero is garbage.",
      "The page is a disaster on mobile and the animation makes me dizzy.",
      "I hate the carousel; it kills performance and it is useless.",
      "Very poor effort on the accessibility side, nothing works with a keyboard.",
      "Il design è brutto, il sito è lento e il menu è inutilizzabile.",
    ])("allows harsh but constructive criticism: %s", (message) => {
      expectAllowed(message);
    });

    /* The counterpart of "personal hostility": the same verbs aimed at the
       work. This is the line the rule must never cross. */
    it.each([
      "I hate this navigation",
      "this navigation sucks",
      "The navigation sucks and the footer is useless.",
      "This site sucks on mobile, the menu does not open.",
      "i hate the navigation, it hides the projects page",
      "I hate the new layout. The old one was better.",
      "I really hate this carousel",
      "we hate the scroll hijacking on the home page",
      "The loading state really sucks and the contrast is bad.",
      "the contrast sucks and you can't read the text",
      "I hate that you have to log in just to read the page",
      "I hate you have to scroll so far to find the prices",
      "Thank you. The footer sucks.",
      "Thank you for the quick reply, the search still sucks.",
      "Mi fa schifo la navigazione, il menu è confuso",
    ])("allows criticism of the product: %s", (message) => {
      expectAllowed(message);
    });

    /* "suck" as a literal verb, with an object or a particle, is not an
       insult. Neither is a technical question. */
    it.each([
      "How do you suck the colour out of this image?",
      "how do you suck the colour out of a photo in CSS",
      "How do you suck up the water with a pump?",
      "How do you suck on a lemon without wincing, asks the tutorial",
      "Can you suck the data out of the CSV and into the table?",
      "does the filter make you suck in air when the page flashes",
      "To fix it you suck the extra whitespace out of the string.",
      "you suck dry the cache and rebuild it",
      "Do you suck up all the memory? The page freezes the browser.",
    ])("allows the literal verb: %s", (message) => {
      expectAllowed(message);
    });

    it.each([
      "I don't think you suck, the design is fine but slow",
      "you don't suck, the navigation just needs work",
      "no, you do not suck at all, the layout is great",
      "I don't hate you for this, but the footer is broken",
      "nobody should hate you for a slow page, just fix the menu",
    ])("allows a denial: %s", (message) => {
      expectAllowed(message);
    });

    it("allows a name that is also a rude word", () => {
      expectAllowed("The layout is clear and easy to follow.", "Dick Smith");
      expectAllowed("The layout is clear and easy to follow.", "Troia");
      expectAllowed("The layout is clear and easy to follow.", "Kike");
      expectAllowed(
        "The layout is clear and easy to follow.",
        "Andrea Agostini",
      );
      expectAllowed(
        "The layout is clear and easy to follow.",
        "María-José O’Neill",
      );
    });

    it("still flags profanity in a name that is not a name", () => {
      expectFlagged("The layout is clear and easy to follow.", "shithead");
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
