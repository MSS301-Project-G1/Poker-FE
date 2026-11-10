import { useState } from 'react'
import { Icon, Button, useToast } from '@/shared/ui'

export default function DeckSkinZipModal({ product, isOpen, onClose, onUploadSuccess, uploadDeckSkinZip }) {
  const notify = useToast()
  const [selectedFile, setSelectedFile] = useState(null)
  const [isUploading, setIsUploading] = useState(false)

  if (!isOpen || !product) return null

  const handleFileChange = e => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.name.endsWith('.zip')) {
        notify('Choose a .zip file.', { type: 'error' })
        return
      }
      setSelectedFile(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    setIsUploading(true)
    try {
      const res = await uploadDeckSkinZip(product.id, selectedFile)
      notify(`Uploaded the 53-card skin for “${product.name}”.`, { type: 'success' })
      onUploadSuccess?.(res)
      onClose()
    } catch (err) {
      notify(err.message || 'ZIP upload failed', { type: 'error' })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-2xl bg-background border border-on-surface/20 p-6 shadow-raised">
        <div className="flex items-center justify-between pb-4 border-b border-on-surface/10">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-tertiary/20 text-tertiary flex items-center justify-center font-bold">
              <Icon name="cloud_upload" className="text-xl" />
            </span>
            <div>
              <h3 className="font-headline font-bold text-base text-on-surface">
                Upload 53-card deck skin (ZIP)
              </h3>
              <p className="text-xs text-on-surface/50">{product.name}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={isUploading} className="text-on-surface/60 hover:text-on-surface">
            <Icon name="close" className="text-xl" />
          </button>
        </div>

        {/* Guidelines */}
        <div className="my-5 p-4 rounded-2xl bg-on-surface/5 border border-on-surface/5 text-xs text-on-surface/70 space-y-1.5">
          <p className="font-bold text-tertiary flex items-center gap-1">
            <Icon name="info" className="text-sm" /> ZIP format:
          </p>
          <ul className="list-disc list-inside space-y-1 text-on-surface/60">
            <li>Exactly 52 card fronts (`2H.png`, `AS.png`, …) and 1 card back (`back.png`).</li>
            <li>The backend unpacks it, converts to WebP and uploads to S3 / MinIO.</li>
            <li>The texture atlas and sprite sheet are generated automatically.</li>
          </ul>
        </div>

        {/* File input area */}
        <div className="border-2 border-dashed border-on-surface/20 rounded-2xl p-6 text-center hover:border-tertiary/50 transition-colors">
          <input
            type="file"
            accept=".zip"
            id="zip-upload-input"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="zip-upload-input" className="cursor-pointer flex flex-col items-center">
            <Icon name="folder_zip" className="text-4xl text-tertiary mb-2" />
            <span className="text-sm font-bold text-on-surface">
              {selectedFile ? selectedFile.name : 'Click to choose a .zip file'}
            </span>
            <span className="text-xs text-on-surface/40 mt-1">
              {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'e.g. kenney_deck_53.zip'}
            </span>
          </label>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="secondary" size="md" disabled={isUploading} onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="gold"
            size="md"
            icon="upload"
            loading={isUploading}
            disabled={!selectedFile}
            onClick={handleUpload}
          >
            Upload
          </Button>
        </div>
      </div>
    </div>
  )
}
