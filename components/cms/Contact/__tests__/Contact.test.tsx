import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithTheme } from "@test-utils/renderWithTheme";

import Contact from "../index";
import { defaultContact, minimalContact } from "../model";

describe("Contact", () => {
  it("renders correctly with all links", () => {
    const { container } = renderWithTheme(<Contact {...defaultContact} />);
    expect(container).toMatchSnapshot();
  });

  it("renders correctly with a single link", () => {
    const { container } = renderWithTheme(<Contact {...minimalContact} />);
    expect(container).toMatchSnapshot();
  });

  it("renders the section label", () => {
    renderWithTheme(<Contact {...defaultContact} />);
    expect(screen.getByText(defaultContact.sectionLabel)).toBeInTheDocument();
  });

  it("renders the heading", () => {
    renderWithTheme(<Contact {...defaultContact} />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      defaultContact.heading,
    );
  });

  it("renders the body text", () => {
    renderWithTheme(<Contact {...defaultContact} />);
    expect(screen.getByText(defaultContact.body)).toBeInTheDocument();
  });

  it("renders all contact links", () => {
    renderWithTheme(<Contact {...defaultContact} />);
    defaultContact.links.forEach(({ label, url }) => {
      const link = screen.getByRole("link", { name: label });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute("href", url);
    });
  });

  it("opens http(s) links in a new tab, safely", () => {
    renderWithTheme(<Contact {...defaultContact} />);
    const webLinks = defaultContact.links.filter(({ url }) =>
      /^https?:\/\//.test(url),
    );
    expect(webLinks.length).toBeGreaterThan(0);
    webLinks.forEach(({ label }) => {
      const link = screen.getByRole("link", { name: label });
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  it("does not open mailto: links in a new tab", () => {
    renderWithTheme(<Contact {...defaultContact} />);
    const mailLinks = defaultContact.links.filter(({ url }) =>
      url.startsWith("mailto:"),
    );
    expect(mailLinks.length).toBeGreaterThan(0);
    mailLinks.forEach(({ label }) => {
      const link = screen.getByRole("link", { name: label });
      expect(link).not.toHaveAttribute("target");
      expect(link).not.toHaveAttribute("rel");
    });
  });

  it("keeps in-page and internal links in the same tab", () => {
    renderWithTheme(
      <Contact
        {...defaultContact}
        links={[
          { label: "Jump", url: "#contact" },
          { label: "Page", url: "/business-details" },
        ]}
      />,
    );
    expect(screen.getByRole("link", { name: "Jump" })).not.toHaveAttribute(
      "target",
    );
    expect(screen.getByRole("link", { name: "Page" })).not.toHaveAttribute(
      "target",
    );
  });

  it("tracks contact and social clicks without sending their URLs", async () => {
    const user = userEvent.setup();
    window.gtag = jest.fn();
    renderWithTheme(<Contact {...defaultContact} />);

    const emailLink = screen.getByRole("link", { name: "Email me" });
    const linkedinLink = screen.getByRole("link", { name: "LinkedIn" });
    emailLink.addEventListener("click", (event) => event.preventDefault());
    linkedinLink.addEventListener("click", (event) => event.preventDefault());
    await user.click(emailLink);
    await user.click(linkedinLink);

    expect(window.gtag).toHaveBeenNthCalledWith(1, "event", "contact_clicked", {
      location: "contact",
      method: "email",
    });
    expect(window.gtag).toHaveBeenNthCalledWith(
      2,
      "event",
      "social_profile_clicked",
      {
        location: "contact",
        platform: "linkedin",
      },
    );
    delete window.gtag;
  });
});
