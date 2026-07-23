import { render } from "@testing-library/react";

import AnalyticsScripts from "../index";

jest.mock("next/script", () => ({
  __esModule: true,
  default: ({
    children,
    strategy: _strategy,
    ...props
  }: React.ScriptHTMLAttributes<HTMLScriptElement> & { strategy?: string }) => (
    <script {...props}>{children}</script>
  ),
}));

const analyticsProps = {
  clarityId: "clarity-project-id",
  gaId: "G-TEST123",
  hasConsent: true,
};

describe("AnalyticsScripts", () => {
  it("does not render analytics on localhost", () => {
    const { container } = render(
      <AnalyticsScripts {...analyticsProps} hostname="localhost" />,
    );

    expect(container.querySelectorAll("script")).toHaveLength(0);
  });

  it("does not render analytics on a Vercel preview", () => {
    const { container } = render(
      <AnalyticsScripts
        {...analyticsProps}
        hostname="personal-website-git-feature.vercel.app"
      />,
    );

    expect(container.querySelectorAll("script")).toHaveLength(0);
  });

  it("does not render analytics without consent on the production domain", () => {
    const { container } = render(
      <AnalyticsScripts
        {...analyticsProps}
        hasConsent={false}
        hostname="agostiniandrea.dev"
      />,
    );

    expect(container.querySelectorAll("script")).toHaveLength(0);
  });

  it.each(["agostiniandrea.dev", "www.agostiniandrea.dev"])(
    "renders GA4 and Clarity once with consent on %s",
    (hostname) => {
      const { container } = render(
        <AnalyticsScripts {...analyticsProps} hostname={hostname} />,
      );

      expect(
        container.querySelectorAll('script[src*="googletagmanager.com"]'),
      ).toHaveLength(1);
      expect(container.querySelectorAll("#ga-init")).toHaveLength(1);
      expect(container.querySelectorAll("#clarity-init")).toHaveLength(1);
    },
  );
});
