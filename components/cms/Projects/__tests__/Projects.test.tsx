import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithTheme } from "@test-utils/renderWithTheme";
import Projects from "../index";
import { defaultProjects, fewItemsProjects, noTagsProject } from "../model";

describe("Projects", () => {
  it("renders correctly with full project list", () => {
    const { container } = renderWithTheme(<Projects {...defaultProjects} />);
    expect(container).toMatchSnapshot();
  });

  it("renders correctly with a single item", () => {
    const { container } = renderWithTheme(<Projects {...fewItemsProjects} />);
    expect(container).toMatchSnapshot();
  });

  it("renders the section label", () => {
    renderWithTheme(<Projects {...defaultProjects} />);
    expect(screen.getByText(defaultProjects.sectionLabel)).toBeInTheDocument();
  });

  it("renders the heading", () => {
    renderWithTheme(<Projects {...defaultProjects} />);
    expect(screen.getByRole("heading", { level: 2 })).toHaveTextContent(
      defaultProjects.heading,
    );
  });

  it("renders all project titles", () => {
    renderWithTheme(<Projects {...defaultProjects} />);
    defaultProjects.items.forEach(({ title }) => {
      expect(screen.getByRole("heading", { name: title })).toBeInTheDocument();
    });
  });

  it("renders tech tags when provided", () => {
    renderWithTheme(<Projects {...defaultProjects} />);
    const firstItem = defaultProjects.items[0];
    firstItem.tags?.forEach((tag) => {
      expect(screen.getAllByText(tag).length).toBeGreaterThan(0);
    });
  });

  it("renders a project link when url is provided", () => {
    renderWithTheme(<Projects {...defaultProjects} />);
    const firstItem = defaultProjects.items[0];
    const link = screen.getByRole("link", { name: `View project: ${firstItem.title}` });
    expect(link).toHaveAttribute("href", firstItem.url);
  });

  it("does not render a link when url is absent", () => {
    renderWithTheme(<Projects {...noTagsProject} />);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("does not render tags when none are provided", () => {
    renderWithTheme(<Projects {...noTagsProject} />);
    expect(screen.queryByText("Next.js")).not.toBeInTheDocument();
  });

  it("tracks project opens using the project title", async () => {
    const user = userEvent.setup();
    const firstItem = defaultProjects.items[0];
    window.gtag = jest.fn();
    renderWithTheme(<Projects {...defaultProjects} />);

    await user.click(screen.getByRole("link", { name: `View project: ${firstItem.title}` }));

    expect(window.gtag).toHaveBeenCalledWith("event", "project_opened", {
      project_name: firstItem.title,
    });
    delete window.gtag;
  });
});
