interface HighlightTextProps {
  text: string
  query: string
  isCurrent?: boolean
}

export function HighlightText({ text, query, isCurrent = false }: HighlightTextProps) {
  const trimmed = query.trim()
  if (!trimmed) return <>{text}</>

  const lowerText = text.toLowerCase()
  const lowerQuery = trimmed.toLowerCase()
  const index = lowerText.indexOf(lowerQuery)

  if (index === -1) return <>{text}</>

  const before = text.slice(0, index)
  const match = text.slice(index, index + trimmed.length)
  const after = text.slice(index + trimmed.length)

  const highlightClass = isCurrent
    ? 'rounded bg-accent/40 px-0.5 ring-1 ring-accent'
    : 'rounded bg-accent/20 px-0.5'

  return (
    <>
      {before}
      <mark className={highlightClass}>{match}</mark>
      {after}
    </>
  )
}
