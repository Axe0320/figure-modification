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
        setLocal(e.target.value)
        if (!composing.current) onValueChange(e.target.value)
      }}
      onCompositionStart={() => { composing.current = true }}
      onCompositionEnd={(e) => {
        composing.current = false
        onValueChange(e.currentTarget.value)
      }}
      onFocus={(e) => { e.currentTarget.style.borderColor = '#6C63FF' }}
      onBlur={(e) => {
        e.currentTarget.style.borderColor = '#E5E7EB'
        onValueChange(e.currentTarget.value)
      }}
    />
  )
}
