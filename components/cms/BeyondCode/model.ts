export interface PassionItem {
  category: string;
  description: string;
  tags?: string[];
}

export interface BeyondCodeProps {
  sectionLabel: string;
  heading: string;
  intro?: string;
  items: PassionItem[];
}

export const defaultBeyondCode: BeyondCodeProps = {
  sectionLabel: "Life & Passions",
  heading: "Beyond the keyboard",
  intro:
    "Work is a big part of who I am, but not the whole story. Here's the rest.",
  items: [
    {
      category: "Sports",
      description:
        "Bologna FC and Virtus Bologna are my teams — I follow both with the kind of loyalty that survives bad seasons. Football and basketball, two cities, one identity.",
      tags: ["Bologna FC", "Virtus Bologna"],
    },
    {
      category: "Travel & Life",
      description:
        "Based in Bangkok since October 2025, previously Amsterdam for 6+ years. Remote-first isn't just a work setup — it's how I choose to live. New city, new language, same curiosity.",
      tags: ["Bangkok", "Amsterdam", "Remote-first"],
    },
    {
      category: "Languages",
      description:
        "Italian native, English professional, Thai in progress. Learning Thai here in Bangkok has been one of the more humbling and rewarding things I've done recently.",
      tags: ["Italian", "English", "Thai"],
    },
  ],
};

export const noIntrosBeyondCode: BeyondCodeProps = {
  sectionLabel: "Life & Passions",
  heading: "Beyond the keyboard",
  items: defaultBeyondCode.items,
};

export const noTagsBeyondCode: BeyondCodeProps = {
  sectionLabel: "Life & Passions",
  heading: "Beyond the keyboard",
  items: [
    {
      category: "Sports",
      description: "Bologna FC and Virtus Bologna — follow both faithfully.",
    },
  ],
};
