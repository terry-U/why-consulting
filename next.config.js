/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // 배포 시 ESLint 검사로 빌드가 중단되지 않도록 함
    ignoreDuringBuilds: true,
  },
  typescript: {
    // 타입 체크를 더 관대하게
    ignoreBuildErrors: false,
  },
  experimental: {
    // 성능 최적화
    optimizePackageImports: ['@radix-ui/react-icons'],
  }
}

module.exports = nextConfig
