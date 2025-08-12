'use client'

import React from 'react'

interface Props {
  pages: string[]
  onFinish: () => void
  onExit: () => void
}

export default function FullscreenIntro({ pages, onFinish, onExit }: Props) {
  const [index, setIndex] = React.useState(0)
  const next = () => {
    if (index < pages.length - 1) setIndex(index + 1)
    else onFinish()
  }

  return (
    <div className="fixed inset-0 z-40 bg-gradient-to-br from-indigo-700 via-purple-700 to-fuchsia-600 text-white flex flex-col">
      <div className="flex items-center justify-between p-4">
        <div className="text-xl font-bold">Why 상담사</div>
        <button onClick={onExit} className="text-white/80 hover:text-white text-sm">나가기</button>
      </div>
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl text-center text-[20px] leading-9">
          {pages[index]}
        </div>
      </div>
      <div className="p-6 flex justify-center">
        <button onClick={next} className="px-6 py-3 rounded-lg bg-white/20 hover:bg-white/30 backdrop-blur shadow-lg">다음</button>
      </div>
    </div>
  )
}


