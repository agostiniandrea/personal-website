import { Container } from "@components/ions";
import { Footer, Header } from "@components/organisms";
import theme from "@config/theme";
import { useMedia } from "@lib/utils/useMedia";

export default function Error() {
  const { isMobile } = useMedia();

  return (
    <>
      <Header
        styles={{
          boxShadow: `0px -3px 0px 0px ${theme?.colors.headline} inset`,
        }}
      />
      <Container
        verticalPadding
        styles={{
          height: isMobile ? "482px" : "",
        }}
      >
        <h1
          style={{
            color: theme?.colors.headline,
            textAlign: "center",
            fontSize: isMobile ? "40px" : "60px",
            marginTop: isMobile ? "auto" : "",
            marginBottom: isMobile ? "auto" : "",
            paddingTop: isMobile ? "" : "200px",
            paddingBottom: isMobile ? "" : "200px",
          }}
        >
          404 - Page not found
        </h1>
      </Container>
      <Footer />
    </>
  );
}
