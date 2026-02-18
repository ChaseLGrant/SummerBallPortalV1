import { CATEGORIES } from '@/lib/constants'
import { ListingCategory } from '@/types/database'

interface CategoryFilterProps {
  selected: ListingCategory | 'all'
  onChange: (category: ListingCategory | 'all') => void
}

export default function CategoryFilter({ selected, onChange }: CategoryFilterProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onChange('all')}
        className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
          selected === 'all'
            ? 'bg-brand-600 text-white'
            : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50'
        }`}
      >
        All
      </button>
      {CATEGORIES.map((cat) => (
        <button
          key={cat.value}
          onClick={() => onChange(cat.value)}
          className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            selected === cat.value
              ? 'bg-brand-600 text-white'
              : 'bg-white text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50'
          }`}
        >
          {cat.icon} {cat.label}
        </button>
      ))}
    </div>
  )
}
