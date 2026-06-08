import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Image, X, CheckCircle } from 'lucide-react'

interface Props {
  onFileSelected: (file: File) => void
  disabled?: boolean
}

// Simple inline dropzone without react-dropzone dependency
export default function UploadZone({ onFileSelected, disabled }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp']
  const MAX_SIZE = 5 * 1024 * 1024 // 5MB

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
            className="relative rounded-2xl overflow-hidden border-2 border-green-500/40"
          >
            <img src={preview} alt="Preview" className="w-full max-h-80 object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-400">
                <CheckCircle className="w-5 h-5" />
                <span className="text-sm font-medium">Image ready</span>
              </div>
              {!disabled && (
                <button
                  onClick={clearPreview}
                  className="p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-all"
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
            className={`flex flex-col items-center justify-center w-full min-h-64 rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 ${
              dragOver
                ? 'border-green-400 bg-green-500/10 scale-102'
                : 'border-green-500/30 bg-white/3 hover:border-green-400/60 hover:bg-green-500/5'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center gap-4 p-8 text-center">
              <motion.div
                animate={{ y: dragOver ? -8 : 0 }}
                className="w-16 h-16 bg-green-500/20 rounded-2xl flex items-center justify-center"
              >
                {dragOver ? (
                  <Image className="w-8 h-8 text-green-400" />
                ) : (
                  <Upload className="w-8 h-8 text-green-400/70" />
                )}
              </motion.div>
              <div>
                <p className="text-white font-semibold text-lg">
                  {dragOver ? 'Drop it here!' : 'Upload your eco proof'}
                </p>
                <p className="text-white/40 text-sm mt-1">
                  Drag & drop or <span className="text-green-400 underline">browse</span>
                </p>
                <p className="text-white/20 text-xs mt-2">JPEG, PNG, WebP · Max 5 MB</p>
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
          className="text-red-400 text-sm mt-2 flex items-center gap-1"
        >
          <X className="w-4 h-4" /> {error}
        </motion.p>
      )}
    </div>
  )
}
