/*
A custom Document can update the <html> and <body> tags used to render a Page.

This file is ideal for including external stylesheets, fonts, and meta tags that should
be present on every page of the application.

Reference the Docs: https://nextjs.org/docs/pages/building-your-application/routing/custom-document
*/

import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html className="dark" lang="en">
      <Head></Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
