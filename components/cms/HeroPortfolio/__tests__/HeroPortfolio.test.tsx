import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithTheme } from "@test-utils/renderWithTheme";
import HeroPortfolio from "../index";
import { defaultHeroPortfolio, noCta } from "../model";

describe("HeroPortfolio", () => {
  it("renders correctly with all props", () => {
    const { container } = renderWithTheme(
      <HeroPortfolio {...defaultHeroPortfolio} />,
    );
    expect(container).toMatchSnapshot();
  });

  it("renders correctly without secondary CTA", () => {
    const { container } = renderWithTheme(<HeroPortfolio {...noCta} />);
    expect(container).toMatchSnapshot();
  });

  it("renders the greeting text", () => {
    renderWithTheme(<HeroPortfolio {...defaultHeroPortfolio} />);
    expect(
      screen.getByText(defaultHeroPortfolio.greeting),
    ).toBeInTheDocument();
  });

  it("renders the name as h1", () => {
    renderWithTheme(<HeroPortfolio {...defaultHeroPortfolio} />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
      defaultHeroPortfolio.personName,
    );
  });

  it("renders the role", () => {
    renderWithTheme(<HeroPortfolio {...defaultHeroPortfolio} />);
    expect(screen.getByText(defaultHeroPortfolio.role)).toBeInTheDocument();
  });

  it("renders the tagline", () => {
    renderWithTheme(<HeroPortfolio {...defaultHeroPortfolio} />);
    expect(screen.getByText(defaultHeroPortfolio.tagline)).toBeInTheDocument();
  });

  it("renders the primary CTA link", () => {
    renderWithTheme(<HeroPortfolio {...defaultHeroPortfolio} />);
    const primaryLink = screen.getByRole("link", {
      name: defaultHeroPortfolio.ctaPrimaryLabel,
    });
    expect(primaryLink).toBeInTheDocument();
    expect(primaryLink).toHaveAttribute("href", defaultHeroPortfolio.ctaPrimaryUrl);
  });

  it("renders the secondary CTA when provided", () => {
    renderWithTheme(<HeroPortfolio {...defaultHeroPortfolio} />);
    const secondaryLink = screen.getByRole("link", {
      name: defaultHeroPortfolio.ctaSecondaryLabel,
    });
    expect(secondaryLink).toBeInTheDocument();
    expect(secondaryLink).toHaveAttribute(
      "href",
      defaultHeroPortfolio.ctaSecondaryUrl,
    );
  });

  it("does not render the secondary CTA when not provided", () => {
    renderWithTheme(<HeroPortfolio {...noCta} />);
    expect(
      screen.queryByText(defaultHeroPortfolio.ctaSecondaryLabel!),
    ).not.toBeInTheDocument();
  });

  it("renders the photo", () => {
    renderWithTheme(<HeroPortfolio {...defaultHeroPortfolio} />);
    expect(screen.getByRole("img")).toHaveAttribute(
      "alt",
      defaultHeroPortfolio.image.alt,
    );
  });

  it("tracks the hero contact CTA", async () => {
    const user = userEvent.setup();
    window.gtag = jest.fn();
    renderWithTheme(<HeroPortfolio {...defaultHeroPortfolio} />);

    const contactLink = screen.getByRole("link", { name: defaultHeroPortfolio.ctaSecondaryLabel });
    contactLink.addEventListener("click", (event) => event.preventDefault());
    await user.click(contactLink);

    expect(window.gtag).toHaveBeenCalledWith("event", "contact_clicked", {
      location: "hero",
      method: "email",
    });
    delete window.gtag;
  });

  it("tracks CV downloads", async () => {
    const user = userEvent.setup();
    window.gtag = jest.fn();
    renderWithTheme(<HeroPortfolio {...defaultHeroPortfolio} />);

    const cvLink = screen.getByRole("link", { name: defaultHeroPortfolio.cvDownloadLabel });
    cvLink.addEventListener("click", (event) => event.preventDefault());
    await user.click(cvLink);

    expect(window.gtag).toHaveBeenCalledWith("event", "cv_downloaded", {
      locale: "en",
    });
    delete window.gtag;
  });
});
