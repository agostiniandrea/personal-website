export interface JourneyChapter {
  city: string;
  country: string;
  years: string;
  age?: string;
  description: string;
  isOngoing?: boolean;
}

export interface JourneyProps {
  sectionLabel?: string;
  heading?: string;
  intro?: string;
  chapters?: JourneyChapter[];
}

export const journeyData: JourneyProps = {
  sectionLabel: "The Journey",
  heading: "A Life in Motion",
  intro:
    "From a small town outside Bologna to the streets of Bangkok — via Turin, Amsterdam, and 35 countries in between.",
  chapters: [
    {
      city: "Bangkok",
      country: "Thailand",
      years: "2025 –",
      age: "33",
      description:
        "In August 2025 I left Amsterdam. Spent a few months rediscovering southern Italy, then in October boarded a one-way flight to Thailand on a digital nomad visa. Same job, same team, different hemisphere. Bangkok is loud, fast, and somehow immediately home. The question mark at the end of this chapter is the point.",
      isOngoing: true,
    },
    {
      city: "Amsterdam",
      country: "Netherlands",
      years: "2019 – 2025",
      age: "26",
      description:
        "Moving to Amsterdam in early 2019 felt like stepping into the version of life I'd been building toward. I lived in the heart of the city, between Centraal and Dam Square, worked in tech, and watched the world flip to remote almost overnight in March 2020. That shift suited me. By 2022 I was fully remote for a Canadian company, working across time zones — and somewhere between a first trip to Indonesia and a winter in British Columbia, I realised the city I lived in mattered less than I'd thought. Amsterdam gave me six and a half good years. It also planted the seed for what came next.",
    },
    {
      city: "Torino",
      country: "Italy",
      years: "2013 – 2018",
      age: "21",
      description:
        "Five years in Turin taught me two things: that learning by doing is the only kind that sticks, and that I wasn't afraid of starting over somewhere new. The ITS programme put me into real projects from day one. By the time I left in late 2018, I had a career — and the confidence to take a much bigger leap.",
    },
    {
      city: "Casalecchio di Reno",
      country: "Italy",
      years: "1992 – 2013",
      description:
        "I grew up just outside Bologna, in a town small enough to know your neighbours and big enough to want more. Secondary school at ITIS Belluzzi in Bologna, where I got serious about code for the first time. Between shifts at the warehouse and the supermarket, I kept studying — and when an ITS ICT programme in Turin came up, with hands-on work in mobile app design, I said yes before I'd finished reading the application.",
    },
  ],
};
