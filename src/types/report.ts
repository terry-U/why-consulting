export type ReportLocale = 'ko-KR' | 'en-US'

export interface ReportBase {
  type: string
  version: string
  locale: ReportLocale
}

export interface MyWhyReport extends ReportBase {
  type: 'my_why'
  headline: string
  markdown: string
  on_why?: string
  off_why_main: string
  off_why_alternatives: string[]
  narrative: string[]
  reflection_questions: string[]
  one_line_template: string
  cta_label: string
  post_prompt: string
}

export type ValueGapLevel = 'high' | 'medium' | 'low'
export interface ValueMapItem {
  head: string
  heart: string
  gapLevel: ValueGapLevel
  headDetail: string
  heartDetail: string
  scene: string
  bridge: string
}

export interface ValueMapReport extends ReportBase {
  type: 'value_map'
  items: ValueMapItem[]
  today_actions?: string[]
  summary?: string
}

export type FitLevel = 'high' | 'medium' | 'conditional'
export interface StylePatternItem {
  title: string
  subtitle: string
  fitLevel: FitLevel
  what: string
  example: string
  why: string
  caution: string
  story: string
}

export interface StylePatternReport extends ReportBase {
  type: 'style_pattern'
  styles: StylePatternItem[]
  quick_tips?: Array<{ id: string; title: string; method: string; tip: string }>
  today_checklist?: string[]
  summary?: string
}

export interface SpectrumScores { others: number; master: number }
export interface SpectrumTypeMeta {
  id: string; name: string; position: string; description: string; traits: string[]
}
export interface SpectrumScene { category: string; evidence: string[]; analysis: string; conclusion: string }
export interface MasterManagerReport extends ReportBase {
  type: 'master_manager_spectrum'
  scores: SpectrumScores
  current_type: SpectrumTypeMeta
  types: SpectrumTypeMeta[]
  scenes: SpectrumScene[]
}

export interface LightStrength { title: string; percentage: number; description: string; insight: string; situations: string[]; roles: string[]; impact: string }
export interface ShadowWeakness { title: string; percentage: number; description: string; insight: string; examples: string[]; solutions: Array<{ title: string; method: string }> }
export interface LightShadowReport extends ReportBase {
  type: 'light_shadow'
  strengths: LightStrength[]
  shadows: ShadowWeakness[]
}

export interface FitTriggersReport extends ReportBase {
  type: 'fit_triggers'
  fit: Array<{ id: string; label: string; active: boolean }>
  negative: Array<{ id: string; label: string; active: boolean }>
  recommendations?: { best_env?: string; cautions?: string }
}

export interface PhilosophyReport extends ReportBase { type: 'philosophy'; letter_content: string }

export interface ActionRecipe { id: string; title: string; duration: string; frequency: string; steps: string[] }
export interface ActionRecipeReport extends ReportBase { type: 'action_recipe'; recipes: ActionRecipe[] }

export interface FutureEnvItem { category: string; items: string[]; impact: string }
export interface FuturePathReport extends ReportBase {
  type: 'future_path'
  environment: { remove: FutureEnvItem[]; strengthen: FutureEnvItem[] }
  roadmap: Array<{ phase: string; duration: string; actions: string[]; milestone: string }>
}

export interface EpilogueInsight { title: string; description: string; score: number }
export interface EpilogueReport extends ReportBase {
  type: 'epilogue'
  overall_score: number
  insights: EpilogueInsight[]
  action_items: string[]
  reflection: string
}

export type AnyReport =
  | MyWhyReport
  | ValueMapReport
  | StylePatternReport
  | MasterManagerReport
  | LightShadowReport
  | FitTriggersReport
  | PhilosophyReport
  | ActionRecipeReport
  | FuturePathReport
  | EpilogueReport


