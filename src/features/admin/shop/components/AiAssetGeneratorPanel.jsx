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
    title: 'Chế Độ Sinh Bộ Bài 52 Lá Dát Vàng / Cyberpunk',
    desc: 'Hệ thống AI sẽ dùng Google Gemini phân tích phong cách thiết kế, chất liệu viền và kết xuất trọn bộ 52 lá bài tây cùng mặt sau lá bài độc quyền.',
  },
  {
    code: 'COIN_SKIN',
    name: 'Skin Chip / Đồng Xu',
    icon: 'monetization_on',
    title: 'Chế Độ Sinh Chip Poker Sứ VIP / Đồng Xu Hoàng Kim',
    desc: 'Hệ thống AI sẽ tạo texture đồng xu kim loại hoặc chip poker sứ nhiều mệnh giá với logo và dải hoa văn viền tinh xảo.',
  },
  {
    code: 'TABLE',
    name: 'Skin Bàn Chơi Poker',
    icon: 'crop_16_9',
    title: 'Chế Độ Sinh Mặt Bàn Poker Nỉ Nhung & Viền Sang Trọng',
    desc: 'Hệ thống AI tạo mặt nỉ nhung cao cấp chuẩn sòng bạc Las Vegas hoặc phong cách Cyberpunk dạ quang cùng viền gỗ/carbon.',
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

  // Load sample dealer girl reference image
  const handleLoadSampleDealerImage = async () => {
    try {
      const response = await fetch('/dealer_girl_reference.jpg')
      const blob = await response.blob()
      const file = new File([blob], 'dealer_girl_sample.jpg', { type: 'image/jpeg' })
      setReferenceImage(file)
      setImagePreviewUrl('/dealer_girl_reference.jpg')
      setExtraDescription('Cô gái chia bài tóc đen buộc nơ hồng, mặc váy hồng sang trọng, phong cách sòng bài quý tộc VIP.')
      setPrimaryColor('#ff80bf')
      notify('✨ Đã nạp ảnh mẫu cô em chia bài thành công!', { type: 'success' })
    } catch (err) {
      notify('Không thể tải ảnh mẫu: ' + err.message, { type: 'error' })
    }
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
          <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
            <label className="text-xs font-bold text-white/80">
              Mẫu Phong Cách Định Sẵn (Style Preset):
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
            Ảnh Tham Chiếu Phong Cách / Logo / Hoa Văn (Reference Image):
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
                  {referenceImage?.name || 'Ảnh cô em chia bài tham chiếu'}
                </div>
                <div className="text-[11px] text-pink-300 mt-0.5">
                  ✓ Đã sẵn sàng nạp vào Google Gemini để phân tích diện mạo và 4 tư thế
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
                    <span>Cắt & Căn Chỉnh Khung (Crop)</span>
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
                  Hoặc bấm nút <b>"Dùng Nhanh Ảnh Mẫu Cô Em Chia Bài"</b> ở góc trên
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
              <span className="text-[11px] font-bold text-white/60 block">Màu Váy/Chính</span>
              <span className="font-mono text-xs text-pink-300 uppercase">{primaryColor}</span>
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
              <span className="text-[11px] font-bold text-white/60 block">Màu Phụ/Tóc</span>
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
              <span className="text-[11px] font-bold text-white/60 block">Viền Vàng/Medal</span>
              <span className="font-mono text-xs text-amber-300 uppercase">{accentColor}</span>
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
            placeholder="Ví dụ: Cô gái tóc đen buộc nơ hồng, mặc váy hồng sang trọng, phong cách sòng bài quý tộc VIP..."
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
            placeholder="Ví dụ: Tránh màu sắc quá chói, không làm hoa văn rối mắt, tránh méo mặt..."
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
                  {currentCategory === 'DEALER'
                    ? 'Hệ thống đã sinh đầy đủ 4 tư thế động và ảnh đại diện tròn. Admin hãy kiểm tra kỹ trước khi đưa lên Cửa Hàng.'
                    : `Hệ thống đã kết xuất gói tài nguyên (${generatedBatch.fileCount || 53} files). Sẵn sàng để phê duyệt.`}
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

          {/* 4 Poses Showcase for DEALER */}
          {currentCategory === 'DEALER' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-sm text-white flex items-center gap-2">
                  <Icon name="sports_esports" className="text-amber-400 text-base" />
                  <span>Bộ Sưu Tập 4 Tư Thế Hoạt Họa Dealer & Avatar Bàn Cược:</span>
                </h4>
                <span className="text-[11px] text-white/50">
                  Nhấp vào ảnh để phóng to xem chi tiết
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
                {/* 1. Idle Pose */}
                <div
                  onClick={() =>
                    setLightboxImage({
                      url: generatedBatch.poseUrls?.idle || generatedBatch.s3PreviewUrl,
                      title: 'Tư Thế 1: Đứng Chờ (Idle)',
                      desc: 'Trạng thái đứng chào người chơi và chờ bắt đầu ván bài mới (idle.png).',
                    })
                  }
                  className="group relative rounded-2xl overflow-hidden bg-black/60 border border-amber-400/30 hover:border-amber-400 p-2 flex flex-col items-center cursor-pointer transition-all hover:scale-[1.02] shadow-lg"
                >
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-[#180b2f] relative">
                    <img
                      src={generatedBatch.poseUrls?.idle || generatedBatch.s3PreviewUrl}
                      alt="Tư thế đứng chờ"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="px-2.5 py-1 rounded-lg bg-black/70 text-white text-[11px] font-bold flex items-center gap-1">
                        <Icon name="zoom_in" className="text-sm text-amber-400" />
                        <span>Xem Lớn</span>
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-300 mt-2 block text-center">
                    1. Đứng Chờ (Idle)
                  </span>
                  <span className="text-[10px] text-white/50 text-center">idle.png ✓</span>
                </div>

                {/* 2. Deal Pose */}
                <div
                  onClick={() =>
                    setLightboxImage({
                      url: generatedBatch.poseUrls?.deal || generatedBatch.s3PreviewUrl,
                      title: 'Tư Thế 2: Chia Bài (Deal)',
                      desc: 'Động tác phóng 2 lá bài tẩy Hole Cards cho người chơi (deal.png).',
                    })
                  }
                  className="group relative rounded-2xl overflow-hidden bg-black/60 border border-cyan-400/30 hover:border-cyan-400 p-2 flex flex-col items-center cursor-pointer transition-all hover:scale-[1.02] shadow-lg"
                >
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-[#180b2f] relative">
                    <img
                      src={generatedBatch.poseUrls?.deal || generatedBatch.s3PreviewUrl}
                      alt="Tư thế chia bài"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="px-2.5 py-1 rounded-lg bg-black/70 text-white text-[11px] font-bold flex items-center gap-1">
                        <Icon name="zoom_in" className="text-sm text-cyan-400" />
                        <span>Xem Lớn</span>
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-cyan-300 mt-2 block text-center">
                    2. Chia Bài (Deal)
                  </span>
                  <span className="text-[10px] text-white/50 text-center">deal.png ✓</span>
                </div>

                {/* 3. Flip Pose */}
                <div
                  onClick={() =>
                    setLightboxImage({
                      url: generatedBatch.poseUrls?.flip || generatedBatch.s3PreviewUrl,
                      title: 'Tư Thế 3: Lật Bài (Flip)',
                      desc: 'Động tác lật các lá bài chung Flop, Turn, River (flip.png).',
                    })
                  }
                  className="group relative rounded-2xl overflow-hidden bg-black/60 border border-emerald-400/30 hover:border-emerald-400 p-2 flex flex-col items-center cursor-pointer transition-all hover:scale-[1.02] shadow-lg"
                >
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-[#180b2f] relative">
                    <img
                      src={generatedBatch.poseUrls?.flip || generatedBatch.s3PreviewUrl}
                      alt="Tư thế lật bài"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="px-2.5 py-1 rounded-lg bg-black/70 text-white text-[11px] font-bold flex items-center gap-1">
                        <Icon name="zoom_in" className="text-sm text-emerald-400" />
                        <span>Xem Lớn</span>
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-300 mt-2 block text-center">
                    3. Lật Bài (Flip)
                  </span>
                  <span className="text-[10px] text-white/50 text-center">flip.png ✓</span>
                </div>

                {/* 4. Win Pose */}
                <div
                  onClick={() =>
                    setLightboxImage({
                      url: generatedBatch.poseUrls?.win || generatedBatch.s3PreviewUrl,
                      title: 'Tư Thế 4: Ăn Mừng (Win)',
                      desc: 'Động tác chúc mừng người chiến thắng với pháo hoa và chip vàng (win.png).',
                    })
                  }
                  className="group relative rounded-2xl overflow-hidden bg-black/60 border border-pink-400/30 hover:border-pink-400 p-2 flex flex-col items-center cursor-pointer transition-all hover:scale-[1.02] shadow-lg"
                >
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-[#180b2f] relative">
                    <img
                      src={generatedBatch.poseUrls?.win || generatedBatch.s3PreviewUrl}
                      alt="Tư thế ăn mừng"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="px-2.5 py-1 rounded-lg bg-black/70 text-white text-[11px] font-bold flex items-center gap-1">
                        <Icon name="zoom_in" className="text-sm text-pink-400" />
                        <span>Xem Lớn</span>
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-pink-300 mt-2 block text-center">
                    4. Ăn Mừng (Win)
                  </span>
                  <span className="text-[10px] text-white/50 text-center">win.png ✓</span>
                </div>

                {/* 5. Avatar Round Badge */}
                <div
                  onClick={() =>
                    setLightboxImage({
                      url: generatedBatch.poseUrls?.avatar || generatedBatch.s3PreviewUrl,
                      title: 'Avatar Huy Chương Tròn Dát Vàng',
                      desc: 'Biểu tượng tròn đại diện của Dealer hiển thị tại bàn cược Poker (avatar_preview.png).',
                    })
                  }
                  className="group relative rounded-2xl overflow-hidden bg-black/60 border border-yellow-400/40 hover:border-yellow-400 p-2 flex flex-col items-center cursor-pointer transition-all hover:scale-[1.02] shadow-lg"
                >
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-[#180b2f] relative flex items-center justify-center p-2">
                    <div className="w-24 h-24 rounded-full p-1 bg-gradient-to-tr from-amber-400 via-yellow-200 to-amber-600 shadow-xl overflow-hidden">
                      <img
                        src={generatedBatch.poseUrls?.avatar || generatedBatch.s3PreviewUrl}
                        alt="Avatar tròn đại diện"
                        className="w-full h-full object-cover rounded-full group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <span className="px-2.5 py-1 rounded-lg bg-black/70 text-white text-[11px] font-bold flex items-center gap-1">
                        <Icon name="zoom_in" className="text-sm text-amber-400" />
                        <span>Xem Lớn</span>
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-yellow-300 mt-2 block text-center">
                    Avatar Huy Chương
                  </span>
                  <span className="text-[10px] text-white/50 text-center">avatar.png ✓</span>
                </div>
              </div>
            </div>
          )}

          {/* Non-Dealer Preview */}
          {currentCategory !== 'DEALER' && generatedBatch.s3PreviewUrl && (
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
                <span className="text-[10px] text-amber-300/80 font-mono mt-1 block">
                  ZIP Package: {generatedBatch.s3ZipUrl}
                </span>
              </div>
            </div>
          )}

          {/* Refine Feedback Input */}
          <div className="pt-3 border-t border-white/10 flex items-center gap-2">
            <input
              type="text"
              placeholder="Chưa ưng ý? Nhập góp ý tinh chỉnh (vd: Làm nơ to hơn, váy màu hồng đậm hơn...)"
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
