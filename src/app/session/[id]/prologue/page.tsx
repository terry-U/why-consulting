'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'

type Prologue = {
  title: string
  on_why: string
  off_why_main: string
  off_why_alternatives: string[]
  narrative: string[]
  reflection_questions: string[]
  one_line_template: string
  cta_label: string
  post_prompt: string
}

export default function ProloguePage() { return null }


