import { useState, useEffect, useRef } from 'react'

interface Props {
  value: string
  onValueChange: (val: string) => void
  placeholder?: string
  className?: string
  style?: React.CSSProperties
}

export default function ImeInput({ value, onValueChange, placeholder, className, style }: Props) {
  const [local, setLocal] = useState(value)
  const composing = useRef(false)

  // Sync from parent (e.g., reset) only when not in IME composition
  useEffect(() => {
    if (!composing.current) setLocal(value)
  }, [value])

  return (
    <input
      type="text"
      value={local}
      placeholder={placeholder}
      className={className}
      style={{
        border: '1px solid #E5E7EB',
        borderRadius: 8,
        outline: 'none',
        transition: 'border-color 0.15s',
        ...style,
      }}
      onChange={(e) => {
        // During IME composition: skip — let the browser own the display.
        // Updating state here causes React to re-render the input, which
        // resets the IME candidate window and garbles Japanese characters.
        if (composing.current) return
        setLocal(e.target.value)
        onValueChange(e.target.value)
      }}
      onCompositionStart={() => { composing.current = true }}
      onCompositionEnd={(e) => {
        composing.current = false
        const val = e.currentTarget.value
        setLocal(val)
        onValueChange(val)
      }}
      onFocus={(e) => { e.currentTarget.style.borderColor = '#6C63FF' }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = '#E5E7EB'
        // Flush any value that may not have been synced
        if (!composing.current) onValueChange(e.currentTarget.value)
      }}
    />
  )
}
