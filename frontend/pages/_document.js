import Document, { Head, Main, NextScript } from 'next/document';
import { ServerStyleSheet } from 'styled-components';

// Copied over from https://github.com/zeit/next.js/blob/canary/examples/with-styled-components/pages/_document.js
// Tells NextJS to render the app as requested, crawl it for any needed styled components, then
// generates all the necessary css and adds it to the returned bundle so that we don't get the flash
// of unstyled content on page load
export default class MyDocument extends Document {
  static getInitialProps({ renderPage }) {
    const sheet = new ServerStyleSheet();
    const page = renderPage((App) => (props) => sheet.collectStyles(<App {...props} />));
    const styleTags = sheet.getStyleElement();
    return { ...page, styleTags };
  }

  render() {
    return (
      <html>
        <Head>{this.props.styleTags}</Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </html>
    );
  }
}
