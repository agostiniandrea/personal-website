import { Container } from "@components/ions";
import Image from "next/image";

export interface HeroPrimaryProps {
  heading: string;
  image: ImageProps;
  description: string;
}

const HeroPrimary: React.FC<HeroPrimaryProps> = ({
  /* heading, */
  image,
  /* description, */
}) => {
  return (
    <Container>
      <div
        style={{
          background: "red",
          height: "600px",
          position: "relative",
          width: "100%",
        }}
      >
        <Image alt={image.alt} src={image.url} fill />
      </div>
    </Container>
  );
};

export default HeroPrimary;
