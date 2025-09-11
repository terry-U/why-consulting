import ExternalReportApp from '../../../../report-external/App'

function getBaseUrl() {
  // 우선순위: 명시적 → Vercel → 로컬 개발
  const explicit = process.env.NEXT_PUBLIC_SITE_URL
  if (explicit && /^https?:\/\//.test(explicit)) return explicit.replace(/\/$/, '')
  const vercel = process.env.VERCEL_URL
  if (vercel) return `https://${vercel}`
  return 'http://localhost:3000'
}

async function fetchJson(url: string, init?: RequestInit) {
  const res = await fetch(url, { cache: 'no-store', ...init })
  if (!res.ok && res.status !== 202) return null
  try { return await res.json() } catch { return null }
}

export default async function ReportPage(props: any) {
  const { id } = await props?.params
  const baseUrl = getBaseUrl()
  const makeUrl = (q: string) => `${baseUrl}/api/session/${id}/report?${q}`
  try {
    // SSR에서는 생성 트리거를 호출하지 않습니다 (중복/경쟁 회피). 클라이언트에서만 트리거.

    // 비용 절감을 위해 실제 화면에서 쓰는 타입만 프리패치
    const types = [
      'my_why','value_map','style_pattern','master_manager_spectrum','light_shadow','philosophy','future_path'
    ] as const

    const reports: Record<string, any> = {}
    const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

    // SSR에서는 기다림을 최소화: 1~2회만 확인하고 바로 렌더(최대 ~600ms)
    await Promise.all(types.map(async (t) => {
      for (let attempt = 0; attempt < 2; attempt++) {
        const data = await fetchJson(makeUrl(`type=${t}`))
        if (data && (data.success || data.report)) {
          reports[t] = data.report || data
          return
        }
        await delay(300 * (attempt + 1))
      }
    }))

    return <ExternalReportApp initialReports={reports} />
  } catch (e) {
    // 개발 중 콘솔 오류 인터셉트를 피하기 위해 경고 레벨로 낮춤
    console.warn('SSR report prefetch failed (fallback to CSR):', e)
    // Fallback to client-side loading to avoid 500
    return <ExternalReportApp />
  }
}
