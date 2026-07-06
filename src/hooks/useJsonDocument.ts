import { useCallback, useEffect, useMemo, useState } from 'react'
import { useDebouncedValue } from '@/hooks/useDebouncedValue'
import { buildTree } from '@/lib/buildTree'
import { parseJson, type ParseResult } from '@/lib/parseJson'
import { clearStoredJson, loadJson, saveJson } from '@/lib/storage'
import type { JsonNode, TreeStats } from '@/types/json'

const LARGE_INPUT_THRESHOLD = 100 * 1024
const SOFT_WARN_BYTES = 5 * 1024 * 1024
const HARD_REJECT_BYTES = 10 * 1024 * 1024

export interface FileMeta {
  name: string
  size: number
}

export interface UseJsonDocumentResult {
  rawInput: string
  setRawInput: (value: string) => void
  parseResult: ParseResult | null
  isParsing: boolean
  fileMeta: FileMeta | null
  fileWarning: string | null
  nodes: JsonNode[]
  stats: TreeStats | null
  didRestoreSession: boolean
  parseNow: () => void
  loadFromFile: (file: File) => Promise<void>
  clearInput: () => void
}

export function useJsonDocument(): UseJsonDocumentResult {
  const [rawInput, setRawInputState] = useState(() => loadJson() ?? '')
  const [didRestoreSession] = useState(() => {
    const saved = loadJson()
    return Boolean(saved?.trim())
  })
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [isParsing, setIsParsing] = useState(false)
  const [fileMeta, setFileMeta] = useState<FileMeta | null>(null)
  const [fileWarning, setFileWarning] = useState<string | null>(null)
  const debouncedInput = useDebouncedValue(rawInput, 300)

  const runParse = useCallback((input: string) => {
    if (input.trim().length === 0) {
      setParseResult(null)
      setIsParsing(false)
      return
    }

    if (input.length > LARGE_INPUT_THRESHOLD) {
      setIsParsing(true)
    }

    window.requestAnimationFrame(() => {
      const result = parseJson(input)
      setParseResult(result)
      setIsParsing(false)
    })
  }, [])

  const parseNow = useCallback(() => {
    runParse(rawInput)
  }, [rawInput, runParse])

  useEffect(() => {
    runParse(debouncedInput)
  }, [debouncedInput, runParse])

  useEffect(() => {
    if (parseResult?.ok) {
      saveJson(rawInput)
    }
  }, [parseResult, rawInput])

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
        event.preventDefault()
        parseNow()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [parseNow])

  const setRawInput = useCallback((value: string) => {
    setRawInputState(value)
    if (value.trim().length === 0) {
      setParseResult(null)
      setFileMeta(null)
      setFileWarning(null)
    }
  }, [])

  const loadFromFile = useCallback(async (file: File) => {
    if (file.size > HARD_REJECT_BYTES) {
      setFileWarning('File exceeds 10MB limit. Please use a smaller JSON file.')
      return
    }

    if (file.size > SOFT_WARN_BYTES) {
      setFileWarning('Large file (>5MB). Parsing may take a moment.')
    } else {
      setFileWarning(null)
    }

    const text = await file.text()
    setFileMeta({ name: file.name, size: file.size })
    setRawInputState(text)
  }, [])

  const clearInput = useCallback(() => {
    setRawInputState('')
    setParseResult(null)
    setFileMeta(null)
    setFileWarning(null)
    setIsParsing(false)
    clearStoredJson()
  }, [])

  const treeData = useMemo(() => {
    if (!parseResult?.ok) {
      return { nodes: [] as JsonNode[], stats: null as TreeStats | null }
    }
    const { nodes, stats } = buildTree(parseResult.data)
    return { nodes, stats }
  }, [parseResult])

  return useMemo(
    () => ({
      rawInput,
      setRawInput,
      parseResult,
      isParsing,
      fileMeta,
      fileWarning,
      nodes: treeData.nodes,
      stats: treeData.stats,
      didRestoreSession,
      parseNow,
      loadFromFile,
      clearInput,
    }),
    [
      rawInput,
      setRawInput,
      parseResult,
      isParsing,
      fileMeta,
      fileWarning,
      treeData,
      didRestoreSession,
      parseNow,
      loadFromFile,
      clearInput,
    ],
  )
}
