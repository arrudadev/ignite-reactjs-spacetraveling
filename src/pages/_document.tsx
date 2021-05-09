import Document, { Html, Head, Main, NextScript } from 'next/document';

const prismicRepoName = /([a-zA-Z0-9-]+)?(\.cdn)?\.prismic\.io/.exec(
  process.env.PRISMIC_API_ENDPOINT
)[1]; // Regex to get repo ID

export default class MyDocument extends Document {
  render(): JSX.Element {
    return (
      <Html>
        <Head>
          <link rel="preconnect" href="https://fonts.gstatic.com" />
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap"
            rel="stylesheet"
          />

          <script
            async
            defer
            src={`https://static.cdn.prismic.io/prismic.js?new=true&repo=${prismicRepoName}`}
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
