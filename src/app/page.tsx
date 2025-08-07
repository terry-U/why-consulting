'use client'

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          🧠 Why 상담사
        </h1>
        <p className="text-gray-600 mb-6">
          배포 테스트 중입니다...
        </p>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-green-800 font-semibold">
            ✅ 기본 페이지 로드 성공!
          </p>
          <p className="text-green-600 text-sm mt-2">
            환경 변수와 API 연결을 준비 중입니다.
          </p>
        </div>
      </div>
    </div>
  )
}
