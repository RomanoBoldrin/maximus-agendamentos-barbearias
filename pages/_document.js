import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html className="dark" lang="en">
      <Head>
        {/* Tailwind CDN */}
        <script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>

        {/* Google Fonts */}
        <link
          href="https://fonts.googleapis.com/css2?family=Newsreader:opsz,wght@6..72,400;6..72,700;6..72,800&family=Work+Sans:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />

        {/* Material Symbols */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />

        {/* Tailwind config */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              tailwind.config = {
                darkMode: "class",
                theme: {
                  extend: {
                    colors: {
                      surface: "#16130c",
                      "surface-container-low": "#1e1b14",
                      "surface-container-lowest": "#110e08",
                      "surface-container-high": "#2d2a22",
                      "surface-container-highest": "#38342c",
                      "surface-variant": "#38342c",
                      "on-surface": "#e9e1d6",
                      "on-surface-variant": "#d3c3c0",
                      background: "#16130c",
                      "on-background": "#e9e1d6",
                      primary: "#e9c349",
                      "on-primary": "#3c2f00",
                      outline: "#9c8d8b",
                      "outline-variant": "#504442"
                    },
                    fontFamily: {
                      headline: ["Newsreader"],
                      body: ["Work Sans"],
                      label: ["Work Sans"]
                    }
                  }
                }
              }
            `,
          }}
        />
      </Head>

      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
