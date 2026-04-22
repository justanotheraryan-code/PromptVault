export default function SearchBar({ value, onChange }) {
  return (
    <div className="search-bar controls-row__search">
      <label className="search-bar__label">// SEARCH VAULT</label>
      <input
        type="text"
        className="search-bar__input"
        placeholder="search by title, body, or tag..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  )
}
