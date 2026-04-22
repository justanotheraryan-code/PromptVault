const CATEGORIES = ['ALL', 'WRITING', 'CODE', 'STRATEGY', 'ANALYSIS']

export default function CategoryFilter({ active, onSelect }) {
  return (
    <nav className="category-filter">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          className={`category-tab${active === cat ? ' category-tab--active' : ''}`}
          onClick={() => onSelect(cat)}
        >
          {cat}
        </button>
      ))}
    </nav>
  )
}
