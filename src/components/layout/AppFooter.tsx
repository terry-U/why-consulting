'use client'

export default function AppFooter() {
  return (
    <footer className="w-full border-t border-white/30 bg-white/60 backdrop-blur-md safe-area-bottom mt-12">
      <div className="ui-container py-6 text-xs text-gray-500 flex items-center justify-between">
        <p>© {new Date().getFullYear()} WHY. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="/onboarding" className="hover:text-gray-700">가이드</a>
          <a href="/home" className="hover:text-gray-700">홈</a>
        </div>
      </div>
    </footer>
  )
}


