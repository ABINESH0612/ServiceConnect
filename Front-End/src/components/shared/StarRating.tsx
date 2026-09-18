import { Star } from 'lucide-react'

interface StarRatingProps {
  value: number
  onChange?: (rating: number) => void
  readonly?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const SIZES = { sm: 'w-4 h-4', md: 'w-5 h-5', lg: 'w-6 h-6' }

export function StarRating({ value, onChange, readonly = false, size = 'md' }: StarRatingProps) {
  return (
    <div className="inline-flex items-center gap-0.5" role={readonly ? 'img' : 'radiogroup'} aria-label={`Rating: ${value} of 5 stars`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(star)}
          className={`${readonly ? 'cursor-default' : 'cursor-pointer hover:scale-110 transition-transform'} focus:outline-none`}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          role={readonly ? undefined : 'radio'}
          aria-checked={readonly ? undefined : star === value}
        >
          <Star
            className={`${SIZES[size]} ${
              star <= value
                ? 'fill-[#F59E0B] text-[#F59E0B]'
                : 'fill-none text-[#CBD5E1]'
            }`}
          />
        </button>
      ))}
    </div>
  )
}
