"use client"

import dynamic from 'next/dynamic'

const ExternalReportApp = dynamic(() => import('../../../../report-external/App'), { ssr: false })

export default function ReportPage() {
  return <ExternalReportApp />
}
