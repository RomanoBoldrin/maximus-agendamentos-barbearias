export default function Home() {
  return (
    <html>
      <head>
        <title>Maximus</title>
      </head>
      <body className="body-text">
        <div>
          <h1>Hello, world!</h1>
          <p>This page is being build... Thanks for visiting though!</p>
        </div>
        <div>
          <p>
            Currently, we're working on the project Backend... But stay sharp!
          </p>
          <div>
            <h2 className="header-2">Preview: What we're planning</h2>
            <img on src="hero.png" className="hero-landing-page-img"></img>
          </div>
          <div>
            <p className="cta-github">Check out our GitHub repo</p>
            <a href="https://github.com/RomanoBoldrin/maximus-agendamentos-barbearias">
              maximus-agendamentos-barbearias
            </a>
          </div>
        </div>
      </body>
    </html>
  );
}
