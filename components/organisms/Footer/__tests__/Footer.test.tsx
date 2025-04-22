import React from "react";
import { screen } from "@testing-library/react";
import { renderWithTheme } from "@test-utils/renderWithTheme";
import Footer from "../index";

describe("Footer", () => {
  it("renders footer with default styles", () => {
    renderWithTheme(<Footer />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toBeInTheDocument();
    expect(footer).toHaveStyle({
      background: "rgb(35, 41, 70)",
    });
  });

  it("renders footer with social links", () => {
    renderWithTheme(<Footer />);

    const socialLinks = screen.getAllByRole("link");
    expect(socialLinks).toHaveLength(2);

    const instagramLink = screen.getByRole("link", { name: "Instagram" });
    expect(instagramLink).toHaveAttribute(
      "href",
      "https://www.instagram.com/alice.diantonio/",
    );
    expect(instagramLink).toHaveAttribute("target", "_blank");
    expect(instagramLink).toHaveAttribute("rel", "noopener noreferrer");

    const tiktokLink = screen.getByRole("link", { name: "TikTok" });
    expect(tiktokLink).toHaveAttribute(
      "href",
      "https://www.tiktok.com/@alicediantonio",
    );
    expect(tiktokLink).toHaveAttribute("target", "_blank");
    expect(tiktokLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders footer with copyright text", () => {
    renderWithTheme(<Footer />);

    const copyright = screen.getByText(/©/);
    expect(copyright).toBeInTheDocument();
    expect(copyright).toHaveTextContent(new Date().getFullYear().toString());
  });
});
