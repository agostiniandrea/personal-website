import { BadgeCheck, MapPin } from "lucide-react";

import { Flex } from "@components/ions";
import { Badge, Section } from "@components/molecules";

export interface AboutProps {
  sectionLabel: string;
  heading: string;
  bio: string;
  location?: string;
  availability?: string;
}

const About: React.FC<AboutProps> = ({
  sectionLabel,
  heading,
  bio,
  location,
  availability,
}) => {
  /* Each tag keeps its own icon: unlike the skill badges elsewhere, these two
     say different kinds of thing (where I am, whether I'm available). */
  const tags = [
    { icon: <MapPin size={15} strokeWidth={2} />, label: location },
    { icon: <BadgeCheck size={15} strokeWidth={2} />, label: availability },
  ].filter((tag) => Boolean(tag.label));

  return (
    <Section id="about" eyebrow={sectionLabel} heading={heading} body={bio}>
      {tags.length > 0 && (
        <Flex gap="md" wrap="wrap">
          {tags.map((tag) => (
            <Badge key={tag.label} size="md" icon={tag.icon}>
              {tag.label}
            </Badge>
          ))}
        </Flex>
      )}
    </Section>
  );
};

export default About;
