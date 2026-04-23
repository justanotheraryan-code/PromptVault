import ThemeToggle from './ThemeToggle'

export default function Header({ totalPrompts, copiesToday, theme, onToggleTheme }) {
  return (
    <header className="header">
      <div className="header__left">
        <div className="header__wordmark">PromptVault</div>
        <div className="header__tagline">Personal prompt library</div>
      </div>
      <div className="header__right">
        <div className="header__stats">
          <div className="header__stat">
            <span className="header__stat-value">{totalPrompts}</span>
            <span className="header__stat-label">Prompts</span>
          </div>
          <div className="header__stat">
            <span className="header__stat-value">{copiesToday}</span>
            <span className="header__stat-label">Copies today</span>
          </div>
        </div>
        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </header>
  )
}
