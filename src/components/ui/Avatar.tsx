interface Props {
  name: string
  color?: string
  size?: number
}

export function Avatar({ name, color = '#6366f1', size = 24 }: Props) {
  const initials = name.slice(0, 2).toUpperCase()
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: size, height: size, borderRadius: '50%',
      background: `${color}33`, border: `1px solid ${color}55`,
      color, fontSize: size * 0.4, fontWeight: 700,
      flexShrink: 0,
    }}>
      {initials}
    </span>
  )
}
