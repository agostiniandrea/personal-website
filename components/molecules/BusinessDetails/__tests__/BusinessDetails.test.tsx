import { screen } from "@testing-library/react";

import { BUSINESS_DETAILS } from "@constants";
import { renderWithTheme } from "@test-utils/renderWithTheme";

import BusinessDetails from "../index";

describe("BusinessDetails", () => {
  it("renders the legal identity of the business", () => {
    renderWithTheme(<BusinessDetails />);

    expect(screen.getByText(BUSINESS_DETAILS.name)).toBeInTheDocument();
    expect(
      screen.getByText(/Piet Heinstraat 12, 7511 JE Enschede, Netherlands/),
    ).toBeInTheDocument();
    expect(screen.getByText(/KVK: 86233858/)).toBeInTheDocument();
    expect(screen.getByText(/VAT ID: NL004214781B58/)).toBeInTheDocument();
  });

  it("links the email address with mailto", () => {
    renderWithTheme(<BusinessDetails />);

    expect(
      screen.getByRole("link", { name: BUSINESS_DETAILS.email }),
    ).toHaveAttribute("href", `mailto:${BUSINESS_DETAILS.email}`);
  });

  it("does not expose a phone number", () => {
    renderWithTheme(<BusinessDetails />);

    expect(screen.queryByText(/\+66|tel:/i)).not.toBeInTheDocument();
  });

  it("renders the same content in the three-row layout", () => {
    renderWithTheme(<BusinessDetails layout="rows" />);

    expect(screen.getByText(BUSINESS_DETAILS.name)).toBeInTheDocument();
    expect(screen.getByText(/KVK: 86233858/)).toBeInTheDocument();
    expect(screen.getByText(/VAT ID: NL004214781B58/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: BUSINESS_DETAILS.email }),
    ).toHaveAttribute("href", `mailto:${BUSINESS_DETAILS.email}`);
  });

  it("links to the privacy policy in both layouts", () => {
    const { unmount } = renderWithTheme(<BusinessDetails />);
    expect(
      screen.getByRole("link", { name: "Privacy policy" }),
    ).toHaveAttribute("href", "/privacy");
    unmount();

    renderWithTheme(<BusinessDetails layout="rows" />);
    expect(
      screen.getByRole("link", { name: "Privacy policy" }),
    ).toHaveAttribute("href", "/privacy");
  });
});
