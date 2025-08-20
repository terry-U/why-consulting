/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 배포 시에만 ESLint 오류를 경고로 처리
    ignoreDuringBuilds: false,
  },
  typescript: {
    // 타입 체크를 더 관대하게
    ignoreBuildErrors: false,
  },
  experimental: {
    // 성능 최적화
    optimizePackageImports: ['@radix-ui/react-icons'],
  },
  // Supabase Edge Functions 제외
  webpack: (config) => {
    config.module.rules.push({
      test: /supabase\/functions/,
      loader: 'ignore-loader'
    })
    return config
  }
}

module.exports = nextConfig
