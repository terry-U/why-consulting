'use client'

import { useState, useCallback } from 'react'

interface AsyncButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  onClickAsync?: () => Promise<void> | void
  busyText?: string
  spinner?: boolean
  // 페이지 전환 등으로 언마운트될 때까지 busy 유지 (성공 시 자동 해제하지 않음)
  persistBusyOnSuccess?: boolean
}

export default function AsyncButton({
  onClickAsync,
  busyText,
  spinner = true,
  persistBusyOnSuccess = false,
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
      // 성공 시: 전환/언마운트까지 유지가 필요하면 busy 유지
      if (!persistBusyOnSuccess) setBusy(false)
    } catch (e) {
      // 에러 시에는 다시 클릭 가능하도록 해제
      setBusy(false)
      throw e
    }
  }, [busy, onClickAsync, persistBusyOnSuccess])

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


