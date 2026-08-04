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
  const tags = [location, availability].filter(Boolean) as string[];

  return (
    <Section id="about" eyebrow={sectionLabel} heading={heading} body={bio}>
      {tags.length > 0 && (
        <Flex gap="md" wrap="wrap">
          {tags.map((tag) => (
            <Badge key={tag} size="md">
              {tag}
            </Badge>
          ))}
        </Flex>
      )}
    </Section>
  );
};

export default About;
