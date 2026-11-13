import BUSINESS_DETAILS from "./businessDetails";

/**
 * The privacy policy, in both languages. It lives in code, not in Contentful,
 * so the text is versioned and reviewed like the rest of the site. Keep it in
 * step with what the site really does: the analytics scripts, the feedback
 * form (pages/api/feedback.ts, supabase/schema.sql), the third-party widgets
 * and the browser storage keys. Update `updated` whenever the text changes.
 */

export interface PolicyItem {
  /** Short lead-in, shown in bold before the text. */
  label?: string;
  text: string;
}

export interface PolicySection {
  id: string;
  heading: string;
  paragraphs?: string[];
  items?: PolicyItem[];
  /** Closing paragraphs, shown after the list. */
  closing?: string[];
}

export interface PrivacyPolicyCopy {
  seoTitle: string;
  seoDescription: string;
  title: string;
  updatedLabel: string;
  updated: string;
  intro: string;
  sections: PolicySection[];
  cookieChoice: {
    heading: string;
    body: string;
    button: string;
  };
}

type PolicyLocale = "en" | "it";

const { name, street, postalCode, city, kvk, email } = BUSINESS_DETAILS;

const COPY: Record<PolicyLocale, PrivacyPolicyCopy> = {
  en: {
    seoTitle: `Privacy policy — ${name}`,
    seoDescription:
      "What personal data this website collects, why, who handles it and what rights you have.",
    title: "Privacy policy",
    updatedLabel: "Last updated",
    updated: "13 November 2026",
    intro:
      "This page explains what personal data this website collects, why, who handles it and what rights you have. I have tried to keep it short and plain. If something is unclear, write to me.",
    sections: [
      {
        id: "controller",
        heading: "Who is responsible",
        paragraphs: [
          `The controller of your personal data is ${name}, a sole proprietorship (eenmanszaak) registered with the Dutch Chamber of Commerce under KVK number ${kvk}, at ${street}, ${postalCode} ${city}, ${BUSINESS_DETAILS.country.en}.`,
          `For anything about your data, write to ${email}.`,
        ],
      },
      {
        id: "collected",
        heading: "What I collect, and why",
        paragraphs: ["Only the following, and only for the purpose stated."],
        items: [
          {
            label: "Visiting the site.",
            text: "The site is served through Cloudflare. As on any website, your IP address and technical details of the request (page, browser, time) are processed to deliver the page and keep it secure. Basis: my legitimate interest in running and protecting the site.",
          },
          {
            label: "Analytics, only if you accept.",
            text: "Google Analytics and Microsoft Clarity measure how the site is used (pages visited, device and browser, approximate location, clicks, scrolling and mouse movement, and session recordings) so I can improve it. Basis: your consent. Nothing is loaded until you choose.",
          },
          {
            label: "Feedback form.",
            text: "If you send feedback through the Forest, I store your message and its category and, only if you provide them, your name, email address and links (LinkedIn, GitHub, website), plus whether you agree to be named publicly. Your IP address is stored with it, to allow one submission per IP every 24 hours and to prevent abuse. Basis: your consent (you choose to send it) and my legitimate interest in preventing abuse. I only publish your name if you ticked the box to be named.",
          },
          {
            label: "Campaign links.",
            text: "If you arrive through a link with campaign tags (UTM source, medium, campaign), they are kept in your browser for the visit and, if you send feedback, saved with it, so I can see which campaigns bring useful feedback. Basis: my legitimate interest.",
          },
          {
            label: "Usability studies.",
            text: "If you come from a study on Prolific, your pseudonymous Prolific ID, study ID and session ID are kept for the visit and saved with your feedback, only to match it to the study. They are never published. Basis: my legitimate interest in running the study, and your participation.",
          },
          {
            label: "Email.",
            text: "If you write to me, I use your address and message only to reply. Basis: handling your request.",
          },
        ],
      },
      {
        id: "cookies",
        heading: "Cookies and browser storage",
        paragraphs: [
          "I set no cookies without your consent. The site keeps a few small items in your browser (local and session storage) that stay on your device, except as described above for feedback:",
        ],
        items: [
          { text: "Your cookie choice (cookie-consent), until you clear it." },
          { text: "Your theme choice, only if you pick one." },
          {
            text: "Whether you have already sent feedback or dismissed a feedback prompt.",
          },
          {
            text: "Campaign tags and study identifiers, for the length of the visit (session storage).",
          },
        ],
        closing: [
          "If you accept analytics, Google Analytics and Microsoft Clarity set their own cookies (for example _ga, _ga_*, _clck and _clsk) to recognise your browser across pages and visits.",
        ],
      },
      {
        id: "third-parties",
        heading: "Other services loaded on the pages",
        paragraphs: [
          "Two services are loaded without a choice, because they are part of how the page is built. Like any server, they see your IP address and the page you are on: Tree-Nation, which provides the Climate Action label in the footer and counts visits to this website for it, and Contentful, which serves the images. To my knowledge neither sets cookies.",
        ],
      },
      {
        id: "recipients",
        heading: "Who receives your data",
        items: [
          { text: "Cloudflare: hosting, delivery and security of the site." },
          {
            text: "Supabase: the database where feedback is stored. Its servers are in Sydney, Australia.",
          },
          {
            text: "Google (Analytics) and Microsoft (Clarity): analytics, only with your consent.",
          },
          { text: "Tree-Nation and Contentful: as described above." },
          {
            text: "Prolific: only for study participants, who come from its platform.",
          },
        ],
        closing: [
          "These providers process data on my behalf or under their own terms. I do not sell your data, and I do not use it for automated decisions or profiling.",
        ],
      },
      {
        id: "transfers",
        heading: "Transfers outside the EU",
        paragraphs: [
          "Feedback stored on Supabase in Sydney is protected by the EU standard contractual clauses included in Supabase's data processing agreement. Transfers to Google, Microsoft and Cloudflare rely on the EU–US Data Privacy Framework or on standard contractual clauses.",
        ],
      },
      {
        id: "retention",
        heading: "How long I keep it",
        items: [
          {
            text: "Feedback, with name, email, links and IP address: for as long as I keep the feedback, or until you ask me to delete it.",
          },
          {
            text: "Analytics data: for the retention period set in Google Analytics and Microsoft Clarity.",
          },
          {
            text: "Email correspondence: for as long as needed to handle your request.",
          },
          {
            text: "Browser storage: until you clear it. You can change your cookie choice below at any time.",
          },
        ],
      },
      {
        id: "rights",
        heading: "Your rights",
        paragraphs: [
          `Under the GDPR you can ask me for access to your data, correction, deletion, restriction of processing and a portable copy, and you can object to processing based on my legitimate interest. Where processing is based on consent, you can withdraw it at any time, without affecting what happened before. Write to ${email}; I will answer within one month.`,
          "If you think I handle your data wrongly, you can complain to the Dutch Data Protection Authority (Autoriteit Persoonsgegevens, autoriteitpersoonsgegevens.nl) or to the authority in your own country.",
        ],
      },
      {
        id: "changes",
        heading: "Changes to this page",
        paragraphs: [
          "If something changes, I will update this page and the date at the top.",
        ],
      },
    ],
    cookieChoice: {
      heading: "Your cookie choice",
      body: "You can change your choice at any time. Cookies already set by Google Analytics and Microsoft Clarity expire on their own, or you can delete them in your browser settings.",
      button: "Change my cookie choice",
    },
  },
  it: {
    seoTitle: `Informativa sulla privacy — ${name}`,
    seoDescription:
      "Quali dati personali raccoglie questo sito, perché, chi li tratta e quali diritti hai.",
    title: "Informativa sulla privacy",
    updatedLabel: "Ultimo aggiornamento",
    updated: "13 novembre 2026",
    intro:
      "Questa pagina spiega quali dati personali raccoglie questo sito, perché, chi li tratta e quali diritti hai. Ho cercato di scriverla breve e chiara. Se qualcosa non ti è chiaro, scrivimi.",
    sections: [
      {
        id: "controller",
        heading: "Chi è il titolare",
        paragraphs: [
          `Il titolare del trattamento dei tuoi dati personali è ${name}, ditta individuale (eenmanszaak) iscritta alla Camera di Commercio olandese con numero KVK ${kvk}, con sede in ${street}, ${postalCode} ${city}, ${BUSINESS_DETAILS.country.it}.`,
          `Per qualsiasi cosa riguardi i tuoi dati, scrivi a ${email}.`,
        ],
      },
      {
        id: "collected",
        heading: "Cosa raccolgo e perché",
        paragraphs: ["Solo quanto segue, e solo per lo scopo indicato."],
        items: [
          {
            label: "Visita del sito.",
            text: "Il sito è servito tramite Cloudflare. Come in ogni sito web, il tuo indirizzo IP e i dettagli tecnici della richiesta (pagina, browser, orario) vengono trattati per consegnare la pagina e tenerla al sicuro. Base giuridica: il mio legittimo interesse a gestire e proteggere il sito.",
          },
          {
            label: "Analisi statistiche, solo se accetti.",
            text: "Google Analytics e Microsoft Clarity misurano come viene usato il sito (pagine visitate, dispositivo e browser, posizione approssimativa, clic, scorrimento e movimenti del mouse, registrazioni delle sessioni) per aiutarmi a migliorarlo. Base giuridica: il tuo consenso. Nulla viene caricato finché non scegli.",
          },
          {
            label: "Modulo dei feedback.",
            text: "Se invii un feedback dalla Forest, conservo il tuo messaggio e la categoria e, solo se li inserisci, il tuo nome, la tua email e i tuoi link (LinkedIn, GitHub, sito web), oltre alla scelta se vuoi essere citato pubblicamente. Insieme viene salvato il tuo indirizzo IP, per consentire un solo invio per IP ogni 24 ore e per prevenire abusi. Base giuridica: il tuo consenso (scegli tu di inviarlo) e il mio legittimo interesse a prevenire abusi. Pubblico il tuo nome solo se hai spuntato la casella per essere citato.",
          },
          {
            label: "Link di campagna.",
            text: "Se arrivi da un link con tag di campagna (UTM: fonte, mezzo, campagna), restano nel tuo browser per la visita e, se invii un feedback, vengono salvati insieme, così vedo quali campagne portano feedback utili. Base giuridica: il mio legittimo interesse.",
          },
          {
            label: "Studi di usabilità.",
            text: "Se arrivi da uno studio su Prolific, il tuo ID Prolific pseudonimo, l'ID dello studio e quello della sessione restano per la visita e vengono salvati con il tuo feedback, solo per collegarlo allo studio. Non vengono mai pubblicati. Base giuridica: il mio legittimo interesse a svolgere lo studio e la tua partecipazione.",
          },
          {
            label: "Email.",
            text: "Se mi scrivi, uso il tuo indirizzo e il tuo messaggio solo per risponderti. Base giuridica: gestire la tua richiesta.",
          },
        ],
      },
      {
        id: "cookies",
        heading: "Cookie e archiviazione nel browser",
        paragraphs: [
          "Non imposto cookie senza il tuo consenso. Il sito salva alcuni piccoli elementi nel tuo browser (archiviazione locale e di sessione) che restano sul tuo dispositivo, salvo quanto indicato sopra per i feedback:",
        ],
        items: [
          {
            text: "La tua scelta sui cookie (cookie-consent), finché non la cancelli.",
          },
          { text: "La scelta del tema, solo se ne scegli uno." },
          {
            text: "Se hai già inviato un feedback o chiuso un invito a lasciarlo.",
          },
          {
            text: "I tag di campagna e gli identificativi dello studio, per la durata della visita (archiviazione di sessione).",
          },
        ],
        closing: [
          "Se accetti le analisi, Google Analytics e Microsoft Clarity impostano i propri cookie (ad esempio _ga, _ga_*, _clck e _clsk) per riconoscere il tuo browser tra pagine e visite.",
        ],
      },
      {
        id: "third-parties",
        heading: "Altri servizi caricati nelle pagine",
        paragraphs: [
          "Due servizi vengono caricati senza una scelta, perché fanno parte di come è costruita la pagina. Come qualsiasi server, vedono il tuo indirizzo IP e la pagina in cui ti trovi: Tree-Nation, che fornisce l'etichetta Climate Action nel footer e per questo conta le visite a questo sito, e Contentful, che serve le immagini. Per quanto ne so, nessuno dei due imposta cookie.",
        ],
      },
      {
        id: "recipients",
        heading: "Chi riceve i tuoi dati",
        items: [
          { text: "Cloudflare: hosting, consegna e sicurezza del sito." },
          {
            text: "Supabase: il database in cui sono conservati i feedback. I suoi server sono a Sydney, in Australia.",
          },
          {
            text: "Google (Analytics) e Microsoft (Clarity): analisi statistiche, solo con il tuo consenso.",
          },
          { text: "Tree-Nation e Contentful: come descritto sopra." },
          {
            text: "Prolific: solo per i partecipanti agli studi, che arrivano dalla sua piattaforma.",
          },
        ],
        closing: [
          "Questi fornitori trattano i dati per mio conto o secondo i propri termini. Non vendo i tuoi dati e non li uso per decisioni automatizzate né per profilazione.",
        ],
      },
      {
        id: "transfers",
        heading: "Trasferimenti fuori dall'UE",
        paragraphs: [
          "I feedback conservati su Supabase a Sydney sono protetti dalle clausole contrattuali standard UE incluse nell'accordo sul trattamento dei dati di Supabase. I trasferimenti verso Google, Microsoft e Cloudflare si basano sull'EU–US Data Privacy Framework o sulle clausole contrattuali standard.",
        ],
      },
      {
        id: "retention",
        heading: "Per quanto tempo li conservo",
        items: [
          {
            text: "Feedback, con nome, email, link e indirizzo IP: finché conservo il feedback, o finché non mi chiedi di cancellarlo.",
          },
          {
            text: "Dati di analisi: per il periodo di conservazione impostato in Google Analytics e Microsoft Clarity.",
          },
          {
            text: "Corrispondenza email: per il tempo necessario a gestire la tua richiesta.",
          },
          {
            text: "Archiviazione nel browser: finché non la cancelli. Puoi cambiare la tua scelta sui cookie qui sotto in qualsiasi momento.",
          },
        ],
      },
      {
        id: "rights",
        heading: "I tuoi diritti",
        paragraphs: [
          `Ai sensi del GDPR puoi chiedermi l'accesso ai tuoi dati, la rettifica, la cancellazione, la limitazione del trattamento e una copia portabile, e puoi oppormi al trattamento basato sul mio legittimo interesse. Quando il trattamento si basa sul consenso, puoi revocarlo in qualsiasi momento, senza pregiudicare quanto avvenuto prima. Scrivi a ${email}: risponderò entro un mese.`,
          "Se ritieni che io tratti i tuoi dati in modo scorretto, puoi presentare reclamo all'autorità olandese per la protezione dei dati (Autoriteit Persoonsgegevens, autoriteitpersoonsgegevens.nl), al Garante per la protezione dei dati personali (garanteprivacy.it) o all'autorità del tuo Paese.",
        ],
      },
      {
        id: "changes",
        heading: "Modifiche a questa pagina",
        paragraphs: [
          "Se qualcosa cambia, aggiornerò questa pagina e la data in alto.",
        ],
      },
    ],
    cookieChoice: {
      heading: "La tua scelta sui cookie",
      body: "Puoi cambiare la tua scelta in qualsiasi momento. I cookie già impostati da Google Analytics e Microsoft Clarity scadono da soli, oppure puoi cancellarli dalle impostazioni del browser.",
      button: "Cambia la mia scelta sui cookie",
    },
  },
};

export function getPrivacyPolicy(locale?: string): PrivacyPolicyCopy {
  return COPY[locale === "it" ? "it" : "en"];
}
