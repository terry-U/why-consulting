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
    // 1) Kick off generation (my_why + cascade). Force once
    await fetchJson(makeUrl('type=my_why&cascade=1&force=1'))

    const types = [
      'my_why','value_map','style_pattern','master_manager_spectrum','fit_triggers','light_shadow','philosophy','action_recipe','future_path','epilogue'
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
