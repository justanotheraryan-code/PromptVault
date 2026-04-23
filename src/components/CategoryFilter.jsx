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
          {cat === 'ALL' ? 'All' : cat.charAt(0) + cat.slice(1).toLowerCase()}
        </button>
      ))}
    </nav>
  )
}
