import ThemeToggle from './ThemeToggle'

export default function Header({
  totalPrompts,
  copiesToday,
  theme,
  onToggleTheme,
  author,
  departments,
  departmentId,
  onChangeDepartment,
  onSignOut,
  view,
  onChangeView,
}) {
  const currentDept = departments.find((d) => d.id === departmentId)
  return (
    <header className="header">
      <div className="header__left">
        <div className="header__wordmark">PromptVault</div>
        <div className="header__tagline">
          {currentDept ? `${currentDept.name} · ${author}` : 'Team prompt library'}
        </div>
      </div>
      <div className="header__right">
        <nav className="header__tabs">
          <button
            className={`header__tab${view === 'library' ? ' header__tab--active' : ''}`}
            onClick={() => onChangeView('library')}
          >
            Library
          </button>
          <button
            className={`header__tab${view === 'analytics' ? ' header__tab--active' : ''}`}
            onClick={() => onChangeView('analytics')}
          >
            Analytics
          </button>
        </nav>

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

        {departments.length > 1 && (
          <select
            className="select header__dept-select"
            value={departmentId || ''}
            onChange={(e) => onChangeDepartment(e.target.value)}
            title="Switch department"
          >
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        )}

        <button className="btn-icon header__signout" onClick={onSignOut} title="Switch user">
          Switch
        </button>

        <ThemeToggle theme={theme} onToggle={onToggleTheme} />
      </div>
    </header>
  )
}
