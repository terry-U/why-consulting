'use client'

import { useState, useCallback } from 'react'

interface AsyncButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClickAsync?: () => Promise<void> | void
  busyText?: string
  spinner?: boolean
}

export default function AsyncButton({
  onClickAsync,
  busyText,
  spinner = true,
  disabled,
  children,
  className = '',
  ...rest
}: AsyncButtonProps) {
  const [busy, setBusy] = useState(false)

  const handleClick = useCallback(async () => {
    if (busy) return
    try {
      setBusy(true)
      await onClickAsync?.()
    } finally {
      setBusy(false)
    }
  }, [busy, onClickAsync])

  return (
    <button
      {...rest}
      onClick={handleClick}
      disabled={disabled || busy}
      className={`${className} disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      {busy && spinner ? (
        <span className="inline-flex items-center gap-2">
          <span className="inline-block w-4 h-4 border-2 border-white/60 border-t-white rounded-full animate-spin" />
          {busyText ? <span>{busyText}</span> : children}
        </span>
      ) : (
        children
      )}
    </button>
  )
}


