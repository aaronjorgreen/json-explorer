export type FixerStatus = 'idle' | 'valid' | 'invalid' | 'repairing' | 'repaired' | 'failed'

export type RepairRuleName =
  | 'normalize_whitespace'
  | 'remove_trailing_commas'
  | 'quote_object_keys'
  | 'insert_missing_commas'
  | 'pretty_format'

export type RepairConfidence = 'high' | 'medium' | 'low'

export interface FixDiagnostic {
  message: string
  line?: number
  column?: number
  char?: number
  hint?: string
}

export interface RepairChange {
  rule: RepairRuleName
  count: number
  confidence: RepairConfidence
  notes?: string
}

export interface FixAttempt {
  id: string
  createdAt: string
  originalInput: string
  fixedOutput: string | null
  wasValidInitially: boolean
  success: boolean
  errorsBefore: FixDiagnostic[]
  errorsAfter: FixDiagnostic[]
  changes: RepairChange[]
}

export type ValidationResult =
  | { ok: true; data: unknown }
  | { ok: false; error: FixDiagnostic }

export interface RepairResult {
  success: boolean
  output: string | null
  changes: RepairChange[]
  errorsBefore: FixDiagnostic[]
  errorsAfter: FixDiagnostic[]
}
