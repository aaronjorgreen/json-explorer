import { useRef, useState, type DragEvent, type ReactNode } from 'react'
import { UploadCloud } from 'lucide-react'

interface DropZoneProps {
  onFileDrop: (file: File) => void
  children: ReactNode
}

export function DropZone({ onFileDrop, children }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const dragDepth = useRef(0)

  const isJsonFile = (file: File) =>
    file.type === 'application/json' || file.name.toLowerCase().endsWith('.json')

  const handleDragEnter = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    dragDepth.current += 1
    setIsDragging(true)
  }

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    dragDepth.current -= 1
    if (dragDepth.current <= 0) {
      dragDepth.current = 0
      setIsDragging(false)
    }
  }

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    dragDepth.current = 0
    setIsDragging(false)

    const file = event.dataTransfer.files.item(0)
    if (file && isJsonFile(file)) {
      onFileDrop(file)
    }
  }

  return (
    <div
      className="relative flex h-full min-h-0 flex-col"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}
      {isDragging ? (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-card border-2 border-dashed border-accent bg-accent/10 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-2 text-accent-light">
            <UploadCloud className="h-8 w-8" aria-hidden="true" />
            <p className="text-sm font-medium">Drop JSON file to upload</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}
