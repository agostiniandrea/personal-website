import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithTheme } from "@test-utils/renderWithTheme";
import Forest from "../index";
import { defaultForest, minimalForest } from "../model";

describe("Forest", () => {
  it("renders correctly with all props", () => {
    const { container } = renderWithTheme(<Forest {...defaultForest} />);
    expect(container).toMatchSnapshot();
  });

  it("renders correctly with minimal props", () => {
    const { container } = renderWithTheme(<Forest {...minimalForest} />);
    expect(container).toMatchSnapshot();
  });

  it("renders the section heading", () => {
    renderWithTheme(<Forest {...defaultForest} />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      defaultForest.heading!,
    );
  });

  it("renders the CTA heading", () => {
    renderWithTheme(<Forest {...defaultForest} />);
    expect(screen.getByRole("heading", { level: 3 })).toHaveTextContent(
      defaultForest.ctaHeading!,
    );
  });

  it("renders the plant button", () => {
    renderWithTheme(<Forest {...defaultForest} />);
    expect(
      screen.getByRole("button", { name: defaultForest.ctaButtonLabel }),
    ).toBeInTheDocument();
  });

  it("renders the season progress label", () => {
    renderWithTheme(<Forest {...defaultForest} />);
    expect(screen.getByText(defaultForest.seasonName!)).toBeInTheDocument();
  });

  it("renders the Tree-Nation link", () => {
    renderWithTheme(<Forest {...defaultForest} />);
    expect(screen.getByRole("link", { name: "Tree-Nation" })).toHaveAttribute(
      "href",
      "https://tree-nation.com",
    );
  });

  it("opens the modal when Plant button is clicked", async () => {
    const user = userEvent.setup();
    renderWithTheme(<Forest {...defaultForest} />);
    const btn = screen.getByRole("button", { name: defaultForest.ctaButtonLabel });
    await user.click(btn);
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes the modal when ✕ is clicked", async () => {
    const user = userEvent.setup();
    renderWithTheme(<Forest {...defaultForest} />);
    await user.click(screen.getByRole("button", { name: defaultForest.ctaButtonLabel }));
    const closeBtn = screen.getByRole("button", { name: "Close" });
    await user.click(closeBtn);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
