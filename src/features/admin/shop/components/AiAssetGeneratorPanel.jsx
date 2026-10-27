import { useState, useEffect } from 'react'
import { Icon, Button, useToast } from '@/shared/ui'
import {
  getActiveAiModels,
  getPromptPresets,
  previewPrompt,
  generateAiAssets,
  refineAiBatch,
} from '../services/adminShopService'
import PromptPreviewModal from './PromptPreviewModal'

export default function AiAssetGeneratorPanel({
  categoryCode = 'CARD_SKIN',
  onAssetGenerated,
  soundFile = null,
}) {
  const notify = useToast()

  // Dynamic models & presets from Backend
  const [models, setModels] = useState([])
  const [presets, setPresets] = useState([])
  const [selectedModelId, setSelectedModelId] = useState('')
  const [selectedPresetId, setSelectedPresetId] = useState('')

  // Prompt options
  const [primaryColor, setPrimaryColor] = useState('#d4af37')
  const [secondaryColor, setSecondaryColor] = useState('#1a0933')
  const [accentColor, setAccentColor] = useState('#00e5ff')
  const [extraDescription, setExtraDescription] = useState('')
  const [avoidElements, setAvoidElements] = useState('')
  const [referenceImage, setReferenceImage] = useState(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')

  // Prompt Preview Modal
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewText, setPreviewText] = useState('')

  // Generation status & result
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStep, setGenerationStep] = useState('')
  const [generatedBatch, setGeneratedBatch] = useState(null)
  const [refineFeedback, setRefineFeedback] = useState('')
  const [isRefining, setIsRefining] = useState(false)

  // Load models & presets on mount or category change
  useEffect(() => {
    let active = true

    async function loadData() {
      try {
        const [modelsRes, presetsRes] = await Promise.all([
          getActiveAiModels(),
          getPromptPresets(categoryCode),
        ])

        if (!active) return

        const activeModels = modelsRes?.data || []
        setModels(activeModels)
        const def = activeModels.find(m => m.isDefault) || activeModels[0]
        if (def) setSelectedModelId(def.id)

        const activePresets = presetsRes?.data || []
        setPresets(activePresets)
        if (activePresets.length > 0) setSelectedPresetId(activePresets[0].id)
      } catch (err) {
        logWarn('Failed to load AI data:', err)
      }
    }

    loadData()
    return () => {
      active = false
    }
  }, [categoryCode])

  const logWarn = (msg, err) => {
    console.warn(msg, err)
  }

  // Handle Reference Image selection
  const handleImageSelect = e => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) {
      notify('Vui lòng chọn file hình ảnh hợp lệ (PNG, JPEG, WebP)', { type: 'error' })
      return
    }
    setReferenceImage(file)
    setImagePreviewUrl(URL.createObjectURL(file))
  }

  const removeReferenceImage = () => {
    setReferenceImage(null)
    if (imagePreviewUrl) URL.revokeObjectURL(imagePreviewUrl)
    setImagePreviewUrl('')
  }

  // Assemble prompt options
  const buildOptions = () => {
    return {
      modelConfigId: selectedModelId || null,
      presetId: selectedPresetId || null,
      primaryColor,
      secondaryColor,
      accentColor,
      extraDescription: extraDescription.trim(),
      avoidElements: avoidElements.trim(),
      sourceFidelity: 80,
    }
  }

  // Handle Preview Prompt
  const handlePreviewPrompt = async () => {
    try {
      const res = await previewPrompt(categoryCode, buildOptions())
      setPreviewText(res?.data || '')
      setShowPreviewModal(true)
    } catch (err) {
      notify(err.message || 'Không thể xem trước prompt', { type: 'error' })
    }
  }

  // Handle Generate
  const handleStartGenerate = async () => {
    setIsGenerating(true)
    setGenerationStep('Đang gửi ảnh & yêu cầu tới AI Model...')

    try {
      setTimeout(() => {
        setGenerationStep('AI đang phân tích bố cục màu sắc & sinh Style Spec...')
      }, 1500)

      setTimeout(() => {
        setGenerationStep('Python Sandbox đang kết xuất Texture Atlas & đóng gói ZIP...')
      }, 3500)

      const res = await generateAiAssets({
        categoryCode,
        options: buildOptions(),
        referenceImage,
        soundFile,
      })

      const batch = res?.data
      setGeneratedBatch(batch)
      notify('✨ Sinh tài nguyên AI thành công!', { type: 'success' })

      if (batch) {
        onAssetGenerated?.({
          batchId: batch.batchId,
          previewUrl: batch.s3PreviewUrl,
          zipUrl: batch.s3ZipUrl,
          styleSpec: batch.styleSpec,
          fileCount: batch.fileCount,
        })
      }
    } catch (err) {
      notify(err.message || 'Quá trình sinh tài nguyên AI thất bại', { type: 'error' })
    } finally {
      setIsGenerating(false)
      setGenerationStep('')
    }
  }

  // Handle Refine
  const handleRefine = async () => {
    if (!refineFeedback.trim() || !generatedBatch?.batchId) return
    setIsRefining(true)
    try {
      const res = await refineAiBatch(generatedBatch.batchId, refineFeedback.trim())
      const updated = res?.data
      setGeneratedBatch(updated)
      setRefineFeedback('')
      notify('Đã tinh chỉnh phong cách theo phản hồi!', { type: 'success' })

      if (updated) {
        onAssetGenerated?.({
          batchId: updated.batchId,
          previewUrl: updated.s3PreviewUrl,
          zipUrl: updated.s3ZipUrl,
          styleSpec: updated.styleSpec,
          fileCount: updated.fileCount,
        })
      }
    } catch (err) {
      notify(err.message || 'Tinh chỉnh thất bại', { type: 'error' })
    } finally {
      setIsRefining(false)
    }
  }

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-b from-[#180b2f] to-[#110622] border border-purple-500/40 shadow-2xl space-y-5 relative">
      <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-wrap gap-2">
        <div className="flex items-center gap-2 text-purple-300 font-headline font-black text-base">
          <Icon name="auto_awesome" className="text-xl text-purple-400" />
          <span>AI Asset Synthesis (Google Gemini & Python Sandbox)</span>
        </div>
        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold uppercase tracking-wider">
          Tạo Tự Động 100%
        </span>
      </div>

      {/* Row 1: AI Model Selector & Style Preset */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-bold text-white/80 block mb-1.5 flex items-center justify-between">
            <span>Chọn Mô Hình AI (AI Model Provider):</span>
            <span className="text-[11px] text-purple-300/60 font-mono">Đồng bộ từ BE</span>
          </label>
          <select
            value={selectedModelId}
            onChange={e => setSelectedModelId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-[#1b0d36] border border-purple-500/30 text-sm font-bold text-white focus:outline-none focus:border-purple-400"
          >
            {models.map(m => (
              <option key={m.id} value={m.id}>
                {m.displayName} {m.isDefault ? '★ (Mặc Định)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-bold text-white/80 block mb-1.5">
            Mẫu Phong Cách Định Sẵn (Style Preset):
          </label>
          <select
            value={selectedPresetId}
            onChange={e => setSelectedPresetId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-[#1b0d36] border border-purple-500/30 text-sm font-bold text-white focus:outline-none focus:border-purple-400"
          >
            {presets.map(p => (
              <option key={p.id} value={p.id}>
                {p.presetName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row 2: Reference Image Upload Box */}
      <div>
        <label className="text-xs font-bold text-white/80 block mb-1.5">
          Ảnh Tham Chiếu Nhân Vật / Biểu Tượng (Reference Image):
        </label>
        <div className="border-2 border-dashed border-purple-500/30 hover:border-purple-400 rounded-3xl p-4 bg-black/40 transition-all">
          {imagePreviewUrl ? (
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-black/60 border border-white/20 p-1 overflow-hidden shrink-0">
                <img
                  src={imagePreviewUrl}
                  alt="Reference Preview"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex-grow min-w-0">
                <div className="text-xs font-bold text-white truncate">{referenceImage?.name}</div>
                <div className="text-[11px] text-white/50 mt-0.5">
                  Dung lượng: {((referenceImage?.size || 0) / 1024).toFixed(1)} KB • Sẵn sàng nạp vào AI
                </div>
                <button
                  type="button"
                  onClick={removeReferenceImage}
                  className="mt-2 text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1"
                >
                  <Icon name="delete" className="text-sm" />
                  <span>Gỡ bỏ ảnh này</span>
                </button>
              </div>
            </div>
          ) : (
            <div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                id="ai-ref-image-input"
                onChange={handleImageSelect}
                className="hidden"
              />
              <label
                htmlFor="ai-ref-image-input"
                className="cursor-pointer flex flex-col items-center py-3"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-2">
                  <Icon name="add_photo_alternate" className="text-2xl" />
                </div>
                <span className="text-xs font-bold text-white">
                  Tải lên ảnh mẫu nhân vật (cô em chia bài, avatar anime, meme, logo rồng...)
                </span>
                <span className="text-[11px] text-white/50 mt-0.5">
                  Hỗ trợ PNG, JPEG, WebP. AI sẽ tự động phân tích và trích xuất đặc trưng phong cách.
                </span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Palette Colors */}
      <div>
        <label className="text-xs font-bold text-white/80 block mb-1.5">
          Bảng Màu Chủ Đạo (Color Palette):
        </label>
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-3">
            <input
              type="color"
              value={primaryColor}
              onChange={e => setPrimaryColor(e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
            />
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-white/60 block">Màu Chính (Viền/Vàng)</span>
              <span className="font-mono text-xs text-amber-300 uppercase">{primaryColor}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-3">
            <input
              type="color"
              value={secondaryColor}
              onChange={e => setSecondaryColor(e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
            />
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-white/60 block">Màu Phụ (Lưng Bài)</span>
              <span className="font-mono text-xs text-purple-300 uppercase">{secondaryColor}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-black/40 border border-white/10 flex items-center gap-3">
            <input
              type="color"
              value={accentColor}
              onChange={e => setAccentColor(e.target.value)}
              className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
            />
            <div className="min-w-0">
              <span className="text-[11px] font-bold text-white/60 block">Màu Điểm Nhấn (Neon)</span>
              <span className="font-mono text-xs text-cyan-300 uppercase">{accentColor}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Extra Description & Avoid Elements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-white/80">
              Miêu tả bổ sung (Ý tưởng chi tiết):
            </label>
            <span className="text-[11px] text-white/40">{extraDescription.length}/500</span>
          </div>
          <textarea
            rows={2}
            maxLength={500}
            placeholder="Ví dụ: Hiệu ứng ánh kim lấp lánh khi lật bài, nơ cổ thêu chỉ vàng..."
            value={extraDescription}
            onChange={e => setExtraDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-2xl bg-black/50 border border-purple-500/20 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-400"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-white/80">
              Yếu tố cần tránh (Negative Prompt):
            </label>
            <span className="text-[11px] text-white/40">{avoidElements.length}/200</span>
          </div>
          <textarea
            rows={2}
            maxLength={200}
            placeholder="Ví dụ: Tránh màu sắc quá chói, không làm hoa văn rối mắt..."
            value={avoidElements}
            onChange={e => setAvoidElements(e.target.value)}
            className="w-full px-3 py-2 rounded-2xl bg-black/50 border border-purple-500/20 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-400"
          />
        </div>
      </div>

      {/* Action Buttons: Preview Prompt & Generate */}
      <div className="flex items-center justify-between pt-3 border-t border-white/10 flex-wrap gap-3">
        <button
          type="button"
          onClick={handlePreviewPrompt}
          className="px-4 py-2 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white/80 hover:text-white transition-all flex items-center gap-1.5"
        >
          <Icon name="visibility" className="text-sm" />
          <span>Xem Trước Cấu Trúc Prompt</span>
        </button>

        <Button
          variant="gold"
          size="md"
          icon="auto_awesome"
          loading={isGenerating}
          onClick={handleStartGenerate}
        >
          {isGenerating ? generationStep || 'Đang Sinh Tài Nguyên...' : '✨ Bắt Đầu Sinh Tài Nguyên Bằng AI'}
        </Button>
      </div>

      {/* Generated Batch Showcase & Refine Area */}
      {generatedBatch && (
        <div className="mt-4 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="check_circle" className="text-emerald-400 text-xl" />
              <div>
                <span className="font-bold text-xs text-emerald-300 block">
                  Đã tạo thành công gói tài nguyên ({generatedBatch.fileCount || 53} files)
                </span>
                <span className="text-[11px] text-white/60">
                  Batch ID: {generatedBatch.batchId?.substring(0, 8)}... • Sẵn sàng nạp vào sản phẩm
                </span>
              </div>
            </div>

            {generatedBatch.s3PreviewUrl && (
              <div className="w-14 h-14 rounded-xl bg-black/60 border border-emerald-400/40 p-1 overflow-hidden shrink-0">
                <img
                  src={generatedBatch.s3PreviewUrl}
                  alt="Generated Preview"
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>

          {/* Refine Feedback Input */}
          <div className="pt-2 border-t border-emerald-500/20 flex items-center gap-2">
            <input
              type="text"
              placeholder="Chưa ưng ý? Nhập góp ý tinh chỉnh (vd: Tăng độ sáng viền vàng, đổi nền sang đỏ mận...)"
              value={refineFeedback}
              onChange={e => setRefineFeedback(e.target.value)}
              className="flex-grow px-3 py-2 rounded-xl bg-black/50 border border-emerald-500/20 text-xs text-white placeholder-white/30 focus:outline-none focus:border-emerald-400"
            />
            <Button
              variant="secondary"
              size="sm"
              icon="tune"
              loading={isRefining}
              onClick={handleRefine}
              disabled={!refineFeedback.trim()}
            >
              Tinh Chỉnh
            </Button>
          </div>
        </div>
      )}

      {/* Prompt Preview Modal */}
      <PromptPreviewModal
        isOpen={showPreviewModal}
        promptText={previewText}
        onClose={() => setShowPreviewModal(false)}
      />
    </div>
  )
}
