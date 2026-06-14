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
        "Bologna FC and Virtus Bologna — followed from Bangkok, where every evening kick-off lands well past midnight.",
      tags: ["Bologna FC", "Virtus Bologna"],
    },
    {
      category: "Travel & Life",
      description:
        "Based in Bangkok since late 2025, after six years in Amsterdam. Fully remote, used to working across time zones with North American and European teams.",
      tags: ["Bangkok", "Amsterdam", "Remote-first"],
    },
    {
      category: "Languages",
      description:
        "Italian native, English professional, Thai in progress — slowly but stubbornly.",
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
