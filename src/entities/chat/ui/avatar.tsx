import classes from './avatar.module.css'

const GRADIENTS: ReadonlyArray<readonly [string, string]> = [
  ['#1D7DF2', '#6FB6FF'],
  ['#22A55B', '#6FD898'],
  ['#F2994A', '#FFC46F'],
  ['#8B5CF6', '#C4A9FF'],
]

const FALLBACK_GRADIENT: readonly [string, string] = ['#1D7DF2', '#6FB6FF']

export const seedHash = (seed: string): number => {
  let hash = 0
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 1_000_000
  }
  return hash
}

const gradientFor = (seed: string): readonly [string, string] =>
  GRADIENTS[seedHash(seed) % GRADIENTS.length] ?? FALLBACK_GRADIENT

export const initialsOf = (name: string): string => {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0)
  const first = words[0]?.charAt(0) ?? '?'
  const second = words[1]?.charAt(0) ?? ''
  return `${first}${second}`.toUpperCase()
}

export interface ChatAvatarProps {
  readonly name: string
  readonly seed: string
  readonly url: string | null
  readonly size: number
}

export function ChatAvatar({ name, seed, url, size }: ChatAvatarProps) {
  if (url !== null) {
    return (
      <span className={classes.avatar} style={{ width: size, height: size }}>
        <img src={url} alt="" className={classes.image} />
      </span>
    )
  }
  const [from, to] = gradientFor(seed)
  return (
    <span
      className={classes.avatar}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${from}, ${to})`,
      }}
    >
      <span
        className={classes.initials}
        style={{ fontSize: Math.max(12, Math.round(size * 0.34)) }}
      >
        {initialsOf(name)}
      </span>
    </span>
  )
}
