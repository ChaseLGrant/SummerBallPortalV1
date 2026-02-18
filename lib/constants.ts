import { ListingCategory } from '@/types/database'

export const CATEGORIES: { value: ListingCategory; label: string; icon: string }[] = [
  { value: 'tickets', label: 'Tickets', icon: '🎫' },
  { value: 'accommodation', label: 'Accommodation', icon: '🏠' },
  { value: 'transport', label: 'Transport', icon: '🚗' },
  { value: 'outfits', label: 'Outfits', icon: '👗' },
  { value: 'accessories', label: 'Accessories', icon: '💎' },
  { value: 'other', label: 'Other', icon: '📦' },
]

export function getCategoryLabel(category: ListingCategory): string {
  return CATEGORIES.find((c) => c.value === category)?.label ?? category
}

export function getCategoryIcon(category: ListingCategory): string {
  return CATEGORIES.find((c) => c.value === category)?.icon ?? '📦'
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(price)
}
