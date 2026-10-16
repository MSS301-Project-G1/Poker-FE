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
        notify('Vui lòng chọn file nén định dạng .zip!', { type: 'error' })
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
      notify(`Đã nạp thành công bộ skin 53 lá vào MinIO / S3 cho "${product.name}"!`, { type: 'success' })
      onUploadSuccess?.(res)
      onClose()
    } catch (err) {
      notify(err.message || 'Tải lên file ZIP thất bại', { type: 'error' })
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg rounded-3xl bg-[#170c2a] border border-white/20 p-6 shadow-2xl">
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-xl bg-amber-400/20 text-amber-400 flex items-center justify-center font-bold">
              <Icon name="cloud_upload" className="text-xl" />
            </span>
            <div>
              <h3 className="font-headline font-bold text-base text-white">
                Tải Lên Skin Bộ Bài 53 Lá (ZIP)
              </h3>
              <p className="text-xs text-white/50">{product.name}</p>
            </div>
          </div>
          <button type="button" onClick={onClose} disabled={isUploading} className="text-white/60 hover:text-white">
            <Icon name="close" className="text-xl" />
          </button>
        </div>

        {/* Guidelines */}
        <div className="my-5 p-4 rounded-2xl bg-white/5 border border-white/5 text-xs text-white/70 space-y-1.5">
          <p className="font-bold text-amber-400 flex items-center gap-1">
            <Icon name="info" className="text-sm" /> Chuẩn định dạng file ZIP:
          </p>
          <ul className="list-disc list-inside space-y-1 text-white/60">
            <li>Nén chính xác 52 lá mặt trước (`2H.png`, `AS.png`...) và 1 lá mặt sau (`back.png`).</li>
            <li>Hệ thống Backend sẽ tự động unpack, tối ưu hóa WebP và stream lên S3 / MinIO.</li>
            <li>Texture Atlas và Sprite Sheet được tạo tự động cho game engine.</li>
          </ul>
        </div>

        {/* File input area */}
        <div className="border-2 border-dashed border-white/20 rounded-2xl p-6 text-center hover:border-amber-400/50 transition-colors">
          <input
            type="file"
            accept=".zip"
            id="zip-upload-input"
            onChange={handleFileChange}
            className="hidden"
          />
          <label htmlFor="zip-upload-input" className="cursor-pointer flex flex-col items-center">
            <Icon name="folder_zip" className="text-4xl text-amber-400 mb-2" />
            <span className="text-sm font-bold text-white">
              {selectedFile ? selectedFile.name : 'Bấm vào đây để chọn file .zip'}
            </span>
            <span className="text-xs text-white/40 mt-1">
              {selectedFile ? `${(selectedFile.size / 1024).toFixed(1)} KB` : 'Ví dụ: kenney_deck_53.zip'}
            </span>
          </label>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <Button variant="secondary" size="md" disabled={isUploading} onClick={onClose}>
            Hủy
          </Button>
          <Button
            variant="gold"
            size="md"
            icon="upload"
            loading={isUploading}
            disabled={!selectedFile}
            onClick={handleUpload}
          >
            Bắt Đầu Ingestion S3
          </Button>
        </div>
      </div>
    </div>
  )
}
