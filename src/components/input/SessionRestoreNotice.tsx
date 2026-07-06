import { useEffect, useRef } from 'react'
import { useJsonDocumentContext } from '@/hooks/JsonDocumentContext'
import { useToast } from '@/hooks/useToast'

export function SessionRestoreNotice() {
  const { didRestoreSession } = useJsonDocumentContext()
  const { showToast } = useToast()
  const shownRef = useRef(false)

  useEffect(() => {
    if (didRestoreSession && !shownRef.current) {
      shownRef.current = true
      showToast('Restored from last session', 'info')
    }
  }, [didRestoreSession, showToast])

  return null
}
