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
import AiGeneratorTutorialModal from './AiGeneratorTutorialModal'

export default function AiAssetGeneratorPanel({
  categoryCode: initialCategoryCode = 'DEALER',
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
  const [primaryColor, setPrimaryColor] = useState('#ff80bf') // default pink dress for dealer girl
  const [secondaryColor, setSecondaryColor] = useState('#1a0933')
  const [accentColor, setAccentColor] = useState('#ffd700')
  const [extraDescription, setExtraDescription] = useState('')
  const [avoidElements, setAvoidElements] = useState('')
  const [referenceImage, setReferenceImage] = useState(null)
  const [imagePreviewUrl, setImagePreviewUrl] = useState('')

  // Modals
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [previewText, setPreviewText] = useState('')
  const [showTutorialModal, setShowTutorialModal] = useState(false)

  // Generation status & result
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationStep, setGenerationStep] = useState('')
  const [generatedBatch, setGeneratedBatch] = useState(null)
  const [refineFeedback, setRefineFeedback] = useState('')
  const [isRefining, setIsRefining] = useState(false)
  const [isApplying, setIsApplying] = useState(false)

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

  // Handle Apply into Shop directly
  const handleApplyToShop = async () => {
    if (!generatedBatch?.batchId) return
    setIsApplying(true)
    try {
      const defaultName = currentCategory === 'DEALER'
        ? 'Cô Em Chia Bài Sexy Nơ Hồng (AI)'
        : 'Vật Phẩm AI #' + generatedBatch.batchId.substring(0, 6)

      await applyAiBatch(generatedBatch.batchId, {
        productName: defaultName,
        priceVipCoin: 150,
        priceVnd: 150000,
      })
      notify('🎉 Đã thêm vật phẩm vào Cửa Hàng thành công!', { type: 'success' })
      onProductApplied?.()
    } catch (err) {
      notify(err.message || 'Không thể áp dụng vào Cửa Hàng', { type: 'error' })
    } finally {
      setIsApplying(false)
    }
  }

  return (
    <div className="p-6 rounded-3xl bg-gradient-to-b from-[#180b2f] to-[#110622] border border-purple-500/40 shadow-2xl space-y-5 relative">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-wrap gap-2">
        <div className="flex items-center gap-2 text-purple-300 font-headline font-black text-base">
          <Icon name="auto_awesome" className="text-xl text-purple-400" />
          <span>AI Asset Synthesis (Google Gemini & Python Sandbox)</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowTutorialModal(true)}
            className="px-3 py-1 rounded-full bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 text-xs font-bold flex items-center gap-1.5 transition-all"
          >
            <Icon name="play_circle" className="text-sm" />
            <span>Xem Video Hướng Dẫn (Tutorial)</span>
          </button>
          <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold uppercase tracking-wider">
            Tạo Tự Động 100%
          </span>
        </div>
      </div>

      {/* Category selector */}
      {allowCategoryChange && (
        <div>
          <label className="text-xs font-bold text-white/80 block mb-1.5">
            Chọn Loại Tài Nguyên Muốn Sinh:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/10">
            <button
              type="button"
              onClick={() => setCurrentCategory('DEALER')}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                currentCategory === 'DEALER'
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Icon name="face" />
              <span>💃 Cô Em Chia Bài (DEALER)</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentCategory('CARD_SKIN')}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                currentCategory === 'CARD_SKIN'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-700 text-white shadow-lg'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Icon name="filter_frames" />
              <span>🎴 Bộ Skin Lá Bài (CARD_SKIN)</span>
            </button>
            <button
              type="button"
              onClick={() => setCurrentCategory('TABLE')}
              className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                currentCategory === 'TABLE'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-lg'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Icon name="crop_16_9" />
              <span>🎲 Bàn Chơi Poker (TABLE)</span>
            </button>
          </div>
        </div>
      )}

      {/* Dealer Notice */}
      {currentCategory === 'DEALER' && (
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-pink-500/15 to-purple-500/15 border border-pink-500/30 flex items-start gap-3">
          <span className="text-2xl shrink-0">💃</span>
          <div className="space-y-1">
            <div className="font-bold text-xs text-pink-300">
              Chế Độ Sinh Dealer 4 Tư Thế Từ 1 Ảnh Nhân Vật
            </div>
            <div className="text-[11px] text-white/70 leading-relaxed">
              Hệ thống sẽ dùng AI phân tích ảnh chân dung và tạo trọn bộ 4 trạng thái hành động trong phòng chơi:
              <b className="text-amber-300"> 1. Đứng chờ (idle)</b>,
              <b className="text-cyan-300"> 2. Chia bài (deal)</b>,
              <b className="text-emerald-300"> 3. Lật bài (flip)</b>,
              <b className="text-pink-300"> 4. Ăn mừng (win)</b> cùng ảnh avatar tròn mạ vàng!
            </div>
          </div>
        </div>
      )}

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
        <div className="flex items-center justify-between mb-1.5 flex-wrap gap-1">
          <label className="text-xs font-bold text-white/80">
            Ảnh Tham Chiếu Nhân Vật / Biểu Tượng (Reference Image):
          </label>
          <button
            type="button"
            onClick={handleLoadSampleDealerImage}
            className="text-[11px] text-pink-300 hover:text-pink-200 font-bold flex items-center gap-1 bg-pink-500/10 px-2 py-0.5 rounded-lg border border-pink-500/20"
          >
            <Icon name="auto_awesome" className="text-xs" />
            <span>Dùng Nhanh Ảnh Mẫu Cô Em Chia Bài</span>
          </button>
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

      {/* Generated Batch Showcase & Refine Area */}
      {generatedBatch && (
        <div className="mt-4 p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <Icon name="check_circle" className="text-emerald-400 text-2xl" />
              <div>
                <span className="font-bold text-sm text-emerald-300 block">
                  {currentCategory === 'DEALER'
                    ? '🎉 Đã tạo thành công Cô Em Chia Bài (4 Tư Thế)'
                    : `🎉 Đã tạo thành công gói tài nguyên (${generatedBatch.fileCount || 53} files)`}
                </span>
                <span className="text-[11px] text-white/60">
                  Batch ID: {generatedBatch.batchId?.substring(0, 8)}... • Sẵn sàng nạp vào Shop
                </span>
              </div>
            </div>

            {/* Preview image */}
            {generatedBatch.s3PreviewUrl && (
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-2xl bg-black/60 border-2 border-amber-400 p-1 overflow-hidden shrink-0 shadow-lg shadow-amber-500/20">
                  <img
                    src={generatedBatch.s3PreviewUrl}
                    alt="Generated Preview"
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                <Button
                  variant="gold"
                  size="sm"
                  icon="add_shopping_cart"
                  loading={isApplying}
                  onClick={handleApplyToShop}
                >
                  Tạo Thành Sản Phẩm Shop
                </Button>
              </div>
            )}
          </div>

          {/* 4 Pose badges for DEALER */}
          {currentCategory === 'DEALER' && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-emerald-500/20 text-center">
              <div className="p-2 rounded-xl bg-black/40 border border-amber-400/30">
                <span className="text-[10px] text-amber-300 font-bold block">1. Đứng Chờ</span>
                <span className="text-xs text-white">idle.png ✓</span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-cyan-400/30">
                <span className="text-[10px] text-cyan-300 font-bold block">2. Chia Bài</span>
                <span className="text-xs text-white">deal.png ✓</span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-emerald-400/30">
                <span className="text-[10px] text-emerald-300 font-bold block">3. Lật Bài</span>
                <span className="text-xs text-white">flip.png ✓</span>
              </div>
              <div className="p-2 rounded-xl bg-black/40 border border-pink-400/30">
                <span className="text-[10px] text-pink-300 font-bold block">4. Ăn Mừng</span>
                <span className="text-xs text-white">win.png ✓</span>
              </div>
            </div>
          )}

          {/* Refine Feedback Input */}
          <div className="pt-2 border-t border-emerald-500/20 flex items-center gap-2">
            <input
              type="text"
              placeholder="Chưa ưng ý? Nhập góp ý tinh chỉnh (vd: Làm nơ to hơn, váy màu hồng đậm hơn...)"
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

      {/* Tutorial Video Modal */}
      <AiGeneratorTutorialModal
        isOpen={showTutorialModal}
        onClose={() => setShowTutorialModal(false)}
      />
    </div>
  )
}
