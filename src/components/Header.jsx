export default function Header({ totalPrompts, copiesToday }) {
  return (
    <header className="header">
      <div className="header__left">
        <div className="header__wordmark type-in">PROMPTVAULT</div>
        <div className="header__tagline type-in-delayed">// PERSONAL PROMPT LIBRARY</div>
      </div>
      <div className="header__right">
        <div className="header__stats">
          <div className="header__stat">
            <span className="header__stat-value cursor-blink">{totalPrompts}</span>
            <span className="header__stat-label">// PROMPTS</span>
          </div>
          <div className="header__stat">
            <span className="header__stat-value">{copiesToday}</span>
            <span className="header__stat-label">// COPIES TODAY</span>
          </div>
        </div>
      </div>
    </header>
  )
}
