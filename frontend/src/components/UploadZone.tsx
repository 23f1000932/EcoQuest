import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Image, X, CheckCircle } from 'lucide-react'

interface Props {
  onFileSelected: (file: File) => void
  disabled?: boolean
}

export default function UploadZone({ onFileSelected, disabled }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
  const MAX_SIZE = 5 * 1024 * 1024

  const handleFile = (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Only JPEG, PNG, and WebP images are accepted')
      return
    }
    if (file.size > MAX_SIZE) {
      setError('Image must be under 5 MB')
      return
    }
    setError(null)
    const url = URL.createObjectURL(file)
    setPreview(url)
    onFileSelected(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  const clearPreview = () => {
    setPreview(null)
    setError(null)
  }

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            key="preview"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative rounded-xl overflow-hidden border-2 border-primary/40"
          >
            <img src={preview} alt="Preview" className="w-full max-h-72 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-white">
                <CheckCircle className="w-5 h-5 text-primary-fixed" />
                <span className="text-sm font-medium">Image ready</span>
              </div>
              {!disabled && (
                <button
                  onClick={clearPreview}
                  aria-label="Remove image"
                  className="p-2 bg-surface/80 hover:bg-surface rounded-full text-on-surface transition-all backdrop-blur-sm"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.label
            key="dropzone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            htmlFor="file-upload"
            className={`flex flex-col items-center justify-center w-full min-h-56 rounded-xl border-2 border-dashed cursor-pointer transition-all duration-300 ${
              dragOver
                ? 'border-primary bg-primary/5 scale-[1.01]'
                : 'border-outline-variant bg-surface-bright hover:bg-surface-container-low hover:border-primary/40'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-4 p-8 text-center">
              <motion.div
                animate={{ y: dragOver ? -6 : 0 }}
                className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center text-primary"
              >
                {dragOver ? (
                  <Image className="w-8 h-8" />
                ) : (
                  <Upload className="w-8 h-8" />
                )}
              </motion.div>
              <div>
                <p className="text-on-background font-semibold text-lg font-geist">
                  {dragOver ? 'Drop it here!' : 'Drag & Drop Image'}
                </p>
                <p className="text-on-surface-variant text-sm mt-1">
                  or <span className="text-primary underline">click to browse</span> from your device
                </p>
                <p className="text-outline text-xs mt-2 font-medium">Supported: JPG, PNG (Max 5MB)</p>
              </div>
            </div>
            <input
              id="file-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              onChange={handleInput}
              disabled={disabled}
            />
          </motion.label>
        )}
      </AnimatePresence>

      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-error text-sm mt-2 flex items-center gap-1"
        >
          <X className="w-4 h-4" /> {error}
        </motion.p>
      )}
    </div>
  )
}
