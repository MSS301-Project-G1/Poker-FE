import { useState, useEffect } from 'react'
import { Icon, Button, useToast } from '@/shared/ui'
import {
  getActiveAiModels,
  getPromptPresets,
  previewPrompt,
  generateAiAssets,
  refineAiBatch,
  applyAiBatch,
} from '../services/adminShopService'
import PromptPreviewModal from './PromptPreviewModal'
import ApproveAiProductModal from './ApproveAiProductModal'
import ImageCropperModal from './ImageCropperModal'
import PresetEditorModal from './PresetEditorModal'

const SUPPORTED_AI_CATEGORIES = [
  {
    code: 'CARD_SKIN',
    name: 'Skin Bộ Bài Tây',
    icon: 'style',
    title: 'Bộ Bài Tây 52 Lá',
    desc: 'Sinh texture 52 mặt lá bài, lưng bài và chất liệu theo phong cách tùy chọn.',
  },
  {
    code: 'COIN_SKIN',
    name: 'Skin Chip / Đồng Xu',
    icon: 'monetization_on',
    title: 'Chip / Đồng Xu Poker',
    desc: 'Sinh texture chip poker sứ hoặc đồng xu kim loại các mệnh giá với hoa văn viền.',
  },
  {
    code: 'TABLE',
    name: 'Skin Bàn Chơi Poker',
    icon: 'crop_16_9',
    title: 'Bàn Chơi Poker',
    desc: 'Sinh texture mặt nỉ bàn và viền bàn chơi theo phong cách sang trọng hoặc hiện đại.',
  },
]

export default function AiAssetGeneratorPanel({
  categoryCode: initialCategoryCode = 'CARD_SKIN',
  categories = [],
  onAssetGenerated,
  soundFile = null,
  allowCategoryChange = true,
  onProductApplied,
}) {
  const notify = useToast()

  // Category state
  const [currentCategory, setCurrentCategory] = useState(initialCategoryCode)

  // Dynamic models & presets from Backend
  const [models, setModels] = useState([])
  const [presets, setPresets] = useState([])
  const [selectedModelId, setSelectedModelId] = useState('')
  const [selectedPresetId, setSelectedPresetId] = useState('')

  // Prompt options
  const [primaryColor, setPrimaryColor] = useState('#ffd700') // Gold
  const [secondaryColor, setSecondaryColor] = useState('#1a0933') // Deep royal purple/dark
  const [accentColor, setAccentColor] = useState('#00e5ff') // Cyan accent
  const [extraDescription, setExtraDescription] = useState('')
  const [avoidElements, setAvoidElements] = useState('')
  const [referenceImage, setReferenceImage] = useState(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')

  // Modals
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewText, setPreviewText] = useState('')
  const [showApprovalModal, setShowApprovalModal] = useState(false)
  const [lightboxImage, setLightboxImage] = useState(null)
  const [showCropper, setShowCropper] = useState(false)
  const [cropperSource, setCropperSource] = useState(null)
  const [showPresetModal, setShowPresetModal] = useState(false)
  const [editingPreset, setEditingPreset] = useState(null)

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
          getPromptPresets(currentCategory),
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
        console.warn('Failed to load AI data:', err)
      }
    }

    loadData()
    return () => {
      active = false
    }
  }, [currentCategory])

  // Handle Reference Image selection from file
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
    if (imagePreviewUrl && imagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreviewUrl)
    }
    setImagePreviewUrl('')
  }

  // Handle Crop Complete
  const handleCropComplete = (croppedFile, dataUrl) => {
    setReferenceImage(croppedFile)
    setImagePreviewUrl(dataUrl)
    notify('Đã căn chỉnh khung hình ảnh tham chiếu!', { type: 'success' })
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
      sourceFidelity: 85,
    }
  }

  // Handle Preview Prompt
  const handlePreviewPrompt = async () => {
    try {
      const res = await previewPrompt(currentCategory, buildOptions())
      setPreviewText(res?.data || '')
      setShowPreviewModal(true)
    } catch (err) {
      notify(err.message || 'Không thể xem trước prompt', { type: 'error' })
    }
  }

  // Handle Generate
  const handleStartGenerate = async () => {
    setIsGenerating(true)
    setGenerationStep('Đang gửi ảnh & yêu cầu tới AI Model (Gemini 1.5 Pro)...')

    try {
      setTimeout(() => {
        setGenerationStep(
          currentCategory === 'DEALER'
            ? 'AI đang phân tích diện mạo nhân vật & sinh 4 tư thế chia bài...'
            : 'AI đang phân tích bố cục màu sắc & sinh Style Spec...'
        )
      }, 1200)

      setTimeout(() => {
        setGenerationStep('Python Sandbox đang kết xuất texture atlas & đóng gói ZIP...')
      }, 2800)

      const res = await generateAiAssets({
        categoryCode: currentCategory,
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
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-wrap gap-2">
        <div className="flex items-center gap-2 text-purple-300 font-headline font-black text-base">
          <Icon name="auto_awesome" className="text-xl text-purple-400" />
          <span>AI Asset Synthesis Studio</span>
        </div>
        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold uppercase tracking-wider">
          Gemini 1.5 Pro & Python Engine
        </span>
      </div>

      {/* Category selector */}
      {allowCategoryChange && (
        <div className="space-y-3">
          <label className="text-xs font-bold text-white/80 block">
            Chọn Loại Tài Nguyên Muốn Sinh (Hỗ Trợ 3 Danh Mục Chính):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {SUPPORTED_AI_CATEGORIES.map(c => {
              const isSelected = currentCategory === c.code

              return (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setCurrentCategory(c.code)}
                  className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-lg shadow-amber-500/10 ring-1 ring-amber-400/30'
                      : 'bg-black/40 border-white/10 text-white/60 hover:border-white/25 hover:text-white'
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 font-black'
                        : 'bg-white/5 text-white/50 border border-white/10'
                    }`}
                  >
                    <Icon name={c.icon} className="text-xl" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-headline font-bold text-xs block text-white">
                      {c.name}
                    </span>
                    <span className="text-[10px] text-white/50 block font-mono">
                      {c.code}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Category Notice Banner */}
      {(() => {
        const catInfo = SUPPORTED_AI_CATEGORIES.find(c => c.code === currentCategory)
        if (!catInfo) return null
        return (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-transparent border border-amber-400/30 flex items-start gap-3">
            <Icon name={catInfo.icon} className="text-2xl text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold text-xs text-amber-300">{catInfo.title}</div>
              <div className="text-[11px] text-white/70 leading-relaxed">{catInfo.desc}</div>
            </div>
          </div>
        )
      })()}

      {/* Row 1: AI Model Selector & Style Preset */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="min-h-[28px] flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-white/80">
              Mô hình AI:
            </label>
            <span className="text-[11px] text-purple-300/60 font-mono">Đồng bộ từ BE</span>
          </div>
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
          <div className="min-h-[28px] flex items-center justify-between mb-1.5 flex-wrap gap-1">
            <label className="text-xs font-bold text-white/80">
              Mẫu phong cách (Style Preset):
            </label>
            <div className="flex items-center gap-1.5">
              {selectedPresetId && (
                <button
                  type="button"
                  onClick={() => {
                    const found = presets.find(p => p.id === selectedPresetId)
                    setEditingPreset(found || null)
                    setShowPresetModal(true)
                  }}
                  className="px-2 py-0.5 rounded-lg bg-white/5 hover:bg-white/10 text-[11px] text-amber-300 font-bold border border-white/10 transition-colors flex items-center gap-1"
                  title="Chỉnh sửa Mẫu Phong Cách này"
                >
                  <Icon name="edit" className="text-xs" />
                  <span>Sửa Preset</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setEditingPreset(null)
                  setShowPresetModal(true)
                }}
                className="px-2 py-0.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-[11px] text-purple-300 font-bold border border-purple-500/30 transition-colors flex items-center gap-1"
                title="Tạo mới Preset cho danh mục này"
              >
                <Icon name="add" className="text-xs" />
                <span>+ Thêm Mới</span>
              </button>
            </div>
          </div>
          <select
            value={selectedPresetId}
            onChange={e => setSelectedPresetId(e.target.value)}
            className="w-full px-4 py-2.5 rounded-2xl bg-[#1b0d36] border border-purple-500/30 text-sm font-bold text-white focus:outline-none focus:border-purple-400"
          >
            {presets.length === 0 ? (
              <option value="">(Chưa có preset - Nhấp [+ Thêm Mới])</option>
            ) : (
              presets.map(p => (
                <option key={p.id} value={p.id}>
                  {p.presetName}
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {/* Row 2: Reference Image Upload Box */}
      <div>
        <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
          <label className="text-xs font-bold text-white/80">
            Ảnh tham chiếu phong cách / Texture mẫu:
          </label>
          <span className="text-[11px] text-white/40">Tùy chọn - Dùng ảnh định hình phong cách</span>
        </div>

        <div className="border-2 border-dashed border-purple-500/30 hover:border-purple-400 rounded-3xl p-4 bg-black/40 transition-all">
          {imagePreviewUrl ? (
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-2xl bg-black/60 border border-white/20 p-1 overflow-hidden shrink-0">
                <img
                  src={imagePreviewUrl}
                  alt="Reference Preview"
                  className="w-full h-full object-cover rounded-xl"
                />
              </div>
              <div className="flex-grow min-w-0">
                <div className="text-xs font-bold text-white truncate">
                  {referenceImage?.name || 'Ảnh tham chiếu phong cách'}
                </div>
                <div className="text-[11px] text-purple-300 mt-0.5">
                  ✓ Đã sẵn sàng nạp để định hình phong cách thiết kế
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setCropperSource(imagePreviewUrl)
                      setShowCropper(true)
                    }}
                    className="text-xs text-amber-300 hover:text-amber-200 font-bold flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400/15 border border-amber-400/30 transition-colors"
                  >
                    <Icon name="crop" className="text-sm" />
                    <span>Cắt & Căn Chỉnh Khung</span>
                  </button>
                  <button
                    type="button"
                    onClick={removeReferenceImage}
                    className="text-xs text-rose-400 hover:text-rose-300 font-bold flex items-center gap-1"
                  >
                    <Icon name="delete" className="text-sm" />
                    <span>Gỡ bỏ</span>
                  </button>
                </div>
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
                className="cursor-pointer flex flex-col items-center py-4 text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-2">
                  <Icon name="add_photo_alternate" className="text-2xl" />
                </div>
                <span className="text-xs font-bold text-white">
                  Nhấp để tải ảnh mẫu từ máy tính (PNG, JPEG, WebP)
                </span>
                <span className="text-[11px] text-white/50 mt-1">
                  Định dạng hoa văn, họa tiết viền hoặc chất liệu
                </span>
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Row 3: Palette Colors */}
      <div>
        <label className="text-xs font-bold text-white/80 block mb-1.5">
          Bảng màu chủ đạo:
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
              <span className="text-[11px] font-bold text-white/60 block">Màu Chủ Đạo</span>
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
              <span className="text-[11px] font-bold text-white/60 block">Màu Phụ / Nền</span>
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
              <span className="text-[11px] font-bold text-white/60 block">Màu Viền / Điểm Nhấn</span>
              <span className="font-mono text-xs text-cyan-300 uppercase">{accentColor}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Extra Description & Avoid Elements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="min-h-[26px] flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-white/80">
              Miêu tả bổ sung (Ý tưởng chi tiết):
            </label>
            <span className="text-[11px] text-white/40">{extraDescription.length}/500</span>
          </div>
          <textarea
            rows={2}
            maxLength={500}
            placeholder="Ví dụ: Hoa văn dát vàng hoàng gia, phong cách sòng bạc cổ điển Monaco..."
            value={extraDescription}
            onChange={e => setExtraDescription(e.target.value)}
            className="w-full px-3 py-2 rounded-2xl bg-black/50 border border-purple-500/20 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-400"
          />
        </div>

        <div>
          <div className="min-h-[26px] flex items-center justify-between mb-1.5">
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
          id="btn-start-ai-generate"
          variant="gold"
          size="md"
          icon="auto_awesome"
          loading={isGenerating}
          onClick={handleStartGenerate}
        >
          {isGenerating ? generationStep || 'Đang Sinh Tài Nguyên...' : '✨ Bắt Đầu Sinh Tài Nguyên Bằng AI'}
        </Button>
      </div>

      {/* Generated Batch Showcase & Approval Area */}
      {generatedBatch && (
        <div className="mt-6 p-6 rounded-3xl bg-[#140a28] border-2 border-amber-400/50 shadow-2xl space-y-6">
          {/* Status Header */}
          <div className="flex items-center justify-between flex-wrap gap-3 pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center font-black">
                <Icon name="palette" className="text-2xl" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-headline font-black text-base text-amber-300">
                    Bản Thảo AI Vừa Sinh (Chưa Phê Duyệt)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold uppercase">
                    Chờ Admin Duyệt
                  </span>
                </div>
                <p className="text-xs text-white/60">
                  Hệ thống đã kết xuất gói tài nguyên ({generatedBatch.fileCount || 53} files). Sẵn sàng để phê duyệt đưa lên Cửa Hàng.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant="secondary"
                size="sm"
                icon="close"
                onClick={() => setGeneratedBatch(null)}
              >
                Hủy Bản Thảo
              </Button>
              <Button
                variant="gold"
                size="md"
                icon="verified"
                onClick={() => setShowApprovalModal(true)}
              >
                Duyệt & Đưa Vào Cửa Hàng
              </Button>
            </div>
          </div>

          {/* Asset Preview Card */}
          {generatedBatch.s3PreviewUrl && (
            <div className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/10">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border border-amber-400/40 bg-black/60 shrink-0">
                <img
                  src={generatedBatch.s3PreviewUrl}
                  alt="Asset Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <span className="font-bold text-sm text-white block">
                  Tài nguyên đã sinh thành công
                </span>
                <span className="text-xs text-white/60 block mt-0.5">
                  Gói gồm {generatedBatch.fileCount || 53} files kết xuất sẵn sàng cho Cửa Hàng.
                </span>
                {generatedBatch.s3ZipUrl && (
                  <span className="text-[10px] text-amber-300/80 font-mono mt-1 block">
                    ZIP Package: {generatedBatch.s3ZipUrl}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Refine Feedback Input */}
          <div className="pt-3 border-t border-white/10 flex items-center gap-2">
            <input
              type="text"
              placeholder="Chưa ưng ý? Nhập góp ý tinh chỉnh (vd: Tăng độ sáng viền vàng, làm hoa văn sắc nét hơn...)"
              value={refineFeedback}
              onChange={e => setRefineFeedback(e.target.value)}
              className="flex-grow px-3.5 py-2.5 rounded-2xl bg-black/50 border border-purple-500/20 text-xs text-white placeholder-white/30 focus:outline-none focus:border-purple-400"
            />
            <Button
              variant="secondary"
              size="sm"
              icon="tune"
              loading={isRefining}
              onClick={handleRefine}
              disabled={!refineFeedback.trim()}
            >
              Tinh Chỉnh Thêm
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

      {/* Approval Modal */}
      <ApproveAiProductModal
        isOpen={showApprovalModal}
        onClose={() => setShowApprovalModal(false)}
        batch={generatedBatch}
        categories={categories}
        currentCategoryCode={currentCategory}
        onSuccess={() => {
          setGeneratedBatch(null)
          onProductApplied?.()
        }}
      />

      {/* Lightbox Modal for Full Size Inspection */}
      {lightboxImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in"
          onClick={() => setLightboxImage(null)}
        >
          <div
            className="relative max-w-xl max-h-[90vh] bg-[#140a28] rounded-3xl border-2 border-amber-400/60 p-4 flex flex-col items-center shadow-2xl space-y-3"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-full flex items-center justify-between pb-2 border-b border-white/10">
              <div>
                <h4 className="font-headline font-black text-sm text-amber-300">
                  {lightboxImage.title}
                </h4>
                <p className="text-[11px] text-white/60">{lightboxImage.desc}</p>
              </div>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center"
              >
                <Icon name="close" className="text-base" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-black/80 max-h-[65vh] flex items-center justify-center">
              <img
                src={lightboxImage.url}
                alt={lightboxImage.title}
                className="max-w-full max-h-[65vh] object-contain"
              />
            </div>

            <div className="w-full flex items-center justify-between pt-2 border-t border-white/10 text-xs text-white/50">
              <span>Độ phân giải kết xuất: 512 x 512 px</span>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="text-amber-400 hover:text-amber-300 font-bold"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Cropper Modal */}
      <ImageCropperModal
        isOpen={showCropper}
        imageSrc={cropperSource}
        cropShape={currentCategory === 'DEALER' ? 'circle' : 'square'}
        onClose={() => setShowCropper(false)}
        onCropComplete={handleCropComplete}
      />

      {/* Preset Editor Modal */}
      <PresetEditorModal
        isOpen={showPresetModal}
        onClose={() => setShowPresetModal(false)}
        preset={editingPreset}
        categoryCode={currentCategory}
        onSaveSuccess={saved => {
          getPromptPresets(currentCategory).then(res => {
            const list = res?.data || []
            setPresets(list)
            if (saved?.id) {
              setSelectedPresetId(saved.id)
            } else if (list.length > 0) {
              setSelectedPresetId(list[0].id)
            }
          })
        }}
      />
    </div>
  )
}
