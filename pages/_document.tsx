import Document, {
  DocumentContext,
  DocumentInitialProps,
  Head,
  Html,
  Main,
  NextScript,
} from "next/document";

import { ServerStyleSheet } from "styled-components";

import { colors } from "@config/customizations/colors";
import { PRE_HYDRATION_VIEW_SCRIPT } from "@lib/utils/mobileNav";

type MyDocumentProps = DocumentInitialProps & { locale: string };

export default class MyDocument extends Document<MyDocumentProps> {
  static async getInitialProps(ctx: DocumentContext): Promise<MyDocumentProps> {
    const sheet = new ServerStyleSheet();
    const originalRenderPage = ctx.renderPage;

    try {
      ctx.renderPage = () =>
        originalRenderPage({
          enhanceApp: (App) => (props) =>
            sheet.collectStyles(<App {...props} />),
        });

      const initialProps = await Document.getInitialProps(ctx);
      return {
        ...initialProps,
        styles: [initialProps.styles, sheet.getStyleElement()],
        locale: ctx.locale || "en",
      };
    } finally {
      sheet.seal();
    }
  }

  render() {
    return (
      <Html lang={this.props.locale}>
        <Head>
          <style
            dangerouslySetInnerHTML={{
              __html: `
                html { background: ${colors.background}; }
                body { background: ${colors.background}; color: ${colors.main}; font-family: sans-serif; margin: 0; padding: 0; }
                a { color: inherit; text-decoration: none; }
                button { background: none; border: none; }
              `,
            }}
          />
        </Head>
        <body>
          {/* Resolves the active mobile view from the hash before first paint
              so deep links (e.g. /#forest) never flash the Home tab */}
          <script
            dangerouslySetInnerHTML={{ __html: PRE_HYDRATION_VIEW_SCRIPT }}
          />
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
