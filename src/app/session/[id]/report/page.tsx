import ExternalReportApp from '../../../../report-external/App'

async function fetchJson(url: string, init?: RequestInit) {
  const res = await fetch(url, { cache: 'no-store', ...init })
  if (!res.ok && res.status !== 202) return null
  try { return await res.json() } catch { return null }
}

export default async function ReportPage(props: any) {
  const { id } = await props?.params
  const makeUrl = (q: string) => `/api/session/${id}/report?${q}`
  try {
    // SSR에서는 생성 트리거를 호출하지 않습니다 (중복/경쟁 회피). 클라이언트에서만 트리거.

    // 비용 절감을 위해 실제 화면에서 쓰는 타입만 프리패치
    const types = [
      'my_why','value_map','style_pattern','master_manager_spectrum','light_shadow','philosophy','future_path'
    ] as const

    const reports: Record<string, any> = {}
    const delay = (ms: number) => new Promise(r => setTimeout(r, ms))

    await Promise.all(types.map(async (t) => {
      for (let attempt = 0; attempt < 8; attempt++) {
        const data = await fetchJson(makeUrl(`type=${t}`))
        if (data && (data.success || data.report)) {
          reports[t] = data.report || data
          return
        }
        await delay(400 * (attempt + 1))
      }
    }))

    return <ExternalReportApp initialReports={reports} />
  } catch (e) {
    console.error('SSR report prefetch failed:', e)
    // Fallback to client-side loading to avoid 500
    return <ExternalReportApp />
  }
}
