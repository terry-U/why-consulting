"use client"

import dynamic from 'next/dynamic'

const ExternalReportApp = dynamic(() => import('../../../../../design-ref/report-page/src/App'), { ssr: false })

export default function ReportPage() {
  return <ExternalReportApp />
}
