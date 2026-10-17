import { Button } from '@mantine/core'

interface Props<T extends string> {
  color: string
  data: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
}

/** A two-or-more way switch: the chosen option is filled, the rest are outlined in the same colour. */
export function Segmented<T extends string>({ color, data, value, onChange }: Props<T>) {
  return (
    <Button.Group>
      {data.map((option) => (
        <Button
          key={option.value}
          size="xs"
          color={color}
          variant={option.value === value ? 'filled' : 'outline'}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </Button.Group>
  )
}
