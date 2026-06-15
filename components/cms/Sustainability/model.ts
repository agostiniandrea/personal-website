export interface VolunteeringItem {
  organization: string;
  period: string;
  description: string;
  cause?: string;
}

export interface SustainabilityProps {
  sectionLabel: string;
  heading: string;
  intro: string;
  valuesHeading?: string;
  values: string[];
  volunteeringHeading?: string;
  volunteeringItems: VolunteeringItem[];
  showCarbonBadge?: boolean;
  carbonBadgeLabel?: string;
}

export const defaultSustainability: SustainabilityProps = {
  sectionLabel: "Values & Action",
  heading: "Sustainability matters to me",
  intro:
    "I believe the tech industry has a responsibility to build lighter, more mindful products. Outside of work, I act on that belief — from how I run this site to how I spend my weekends.",
  valuesHeading: "What I care about",
  values: [
    "Environment",
    "Animal Welfare",
    "Social Services",
    "Disaster & Humanitarian Relief",
    "Education",
    "Science & Technology",
  ],
  volunteeringHeading: "Where I've shown up",
  volunteeringItems: [
    {
      organization: "Clean Up Your City",
      period: "May – Sep 2024",
      cause: "Environment",
      description:
        "Monthly clean-up initiatives in Amsterdam city center, working with residents and local entrepreneurs to maintain public spaces.",
    },
    {
      organization: "NDSM Cleans Up",
      period: "Jun – Sep 2024",
      cause: "Environment",
      description:
        "Monthly clean-up events at NDSM Wharf, Amsterdam's former industrial shipyard turned cultural hub.",
    },
    {
      organization: "About Waste",
      period: "Jun 2024",
      cause: "Environment",
      description:
        "Volunteered at the Silent Disco Party Cleanup at IJ-Hallen, Europe's largest flea market, combining environmental action with community fun.",
    },
    {
      organization: "Serve the City Amsterdam",
      period: "May – Sep 2024",
      cause: "Environment",
      description:
        "Community clean-up events at Vondelpark, supporting the park maintenance team in keeping one of Amsterdam's most visited public spaces clean.",
    },
    {
      organization: "Stichting Care4Good Foundation",
      period: "Mar 2024",
      cause: "Social Services",
      description:
        "Helped unload and organize donated furniture for people experiencing homelessness and Ukrainian refugees.",
    },
    {
      organization: "Municipality of Casalecchio di Reno",
      period: "Jun – Jul 2009",
      cause: "Education",
      description:
        "Student volunteer at a summer youth program, supporting children's daily activities and ensuring their safety and wellbeing.",
    },
  ],
  showCarbonBadge: true,
  carbonBadgeLabel:
    "This site is cleaner than most of the web. I care about digital footprint just as much as the physical one.",
};

export const minimalSustainability: SustainabilityProps = {
  sectionLabel: "Values & Action",
  heading: "Sustainability matters to me",
  intro: "I believe the tech industry has a responsibility to build lighter, more mindful products.",
  values: ["Environment", "Education"],
  volunteeringItems: [
    {
      organization: "Clean Up Your City",
      period: "May – Sep 2024",
      description: "Monthly clean-up initiatives in Amsterdam city center.",
    },
  ],
};

export const noCarbonBadgeSustainability: SustainabilityProps = {
  ...defaultSustainability,
  showCarbonBadge: false,
  carbonBadgeLabel: undefined,
};
