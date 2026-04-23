export default function SearchBar({ value, onChange }) {
  return (
    <div className="search-bar">
      <input
        type="text"
        className="search-bar__input"
        placeholder="Search by title, body, or tag…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete="off"
        spellCheck={false}
      />
    </div>
  )
}
