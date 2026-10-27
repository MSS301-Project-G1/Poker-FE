import { useState, useMemo, useRef, useEffect } from 'react'
import { Icon, Button, useToast } from '@/shared/ui'
import { formatVipCoin, formatVnd } from '../utils/adminFormatters'
import CosmeticRenderer from '@/features/shop/components/CosmeticRenderer'
import AddCategoryModal from './AddCategoryModal'
import ImageCropperModal from './ImageCropperModal'
import { uploadProductSound, uploadAssetFile } from '../services/adminShopService'

export default function AddProductControlPanel({
  categories = [],
  onRefreshCategories,
  createProduct,
  uploadDeckSkinZip,
  uploadDeckSkinFiles,
  onSuccess,
  onCancel,
}) {
  const notify = useToast()

  // Modal Category & Cropper
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
  const [showCropperModal, setShowCropperModal] = useState(false)
  const [cropperSource, setCropperSource] = useState(null)

  // Selected Category
  const [selectedCategoryId, setSelectedCategoryId] = useState(categories[0]?.id || '')

  useEffect(() => {
    if (!selectedCategoryId && categories.length > 0) {
      setSelectedCategoryId(categories[0].id)
    }
  }, [categories, selectedCategoryId])

  const currentCategory = useMemo(() => {
    return categories.find(c => c.id === selectedCategoryId) || categories[0]
  }, [categories, selectedCategoryId])

  const catCode = useMemo(() => {
    return String(currentCategory?.code || '').toUpperCase()
  }, [currentCategory])

  // Form Fields
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tier, setTier] = useState('VIP')
  const [priceVnd, setPriceVnd] = useState(50000)
  const [priceVipCoin, setPriceVipCoin] = useState(50)
  const [isExclusive, setIsExclusive] = useState(false)
  const [isFlashSale, setIsFlashSale] = useState(false)
  const [flashSalePreset, setFlashSalePreset] = useState('2_DAYS')
  const [customSaleExpiresAt, setCustomSaleExpiresAt] = useState('')

  // Local Files & Previews (Local First - Only uploaded to S3 upon clicking Submit)
  const [localAssetFile, setLocalAssetFile] = useState(null)
  const [localAssetPreviewUrl, setLocalAssetPreviewUrl] = useState('')
  const [localVideoFile, setLocalVideoFile] = useState(null)
  const [localVideoPreviewUrl, setLocalVideoPreviewUrl] = useState('')
  const [localSoundFile, setLocalSoundFile] = useState(null)
  const [localSoundPreviewUrl, setLocalSoundPreviewUrl] = useState('')

  // Card Skin specific files
  const [deckMethod, setDeckMethod] = useState('ZIP') // 'ZIP' | 'FILES'
  const [selectedZipFile, setSelectedZipFile] = useState(null)
  const [selectedImageFiles, setSelectedImageFiles] = useState([])

  // Fallback URLs if admin enters custom URLs manually
  const [manualAssetUrl, setManualAssetUrl] = useState('')
  const [manualVideoUrl, setManualVideoUrl] = useState('')

  // Sound player
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const audioRef = useRef(null)

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStep, setSubmitStep] = useState('')

  // Sale expiration calculation
  const computedSaleExpiresAt = useMemo(() => {
    if (!isFlashSale) return null
    if (flashSalePreset === 'CUSTOM') {
      return customSaleExpiresAt ? new Date(customSaleExpiresAt).toISOString() : null
    }
    const msMap = {
      '12_HOURS': 12 * 60 * 60 * 1000,
      '1_DAY': 24 * 60 * 60 * 1000,
      '2_DAYS': 2 * 24 * 60 * 60 * 1000,
      '3_DAYS': 3 * 24 * 60 * 60 * 1000,
      '7_DAYS': 7 * 24 * 60 * 60 * 1000,
    }
    const ms = msMap[flashSalePreset] || (2 * 24 * 60 * 60 * 1000)
    return new Date(Date.now() + ms).toISOString()
  }, [isFlashSale, flashSalePreset, customSaleExpiresAt])

  // Price synchronization
  const handlePriceVndChange = val => {
    const vnd = Math.max(0, Number(val) || 0)
    setPriceVnd(vnd)
    setPriceVipCoin(Math.round(vnd / 1000))
  }

  const handlePriceVipCoinChange = val => {
    const vip = Math.max(0, Number(val) || 0)
    setPriceVipCoin(vip)
    setPriceVnd(vip * 1000)
  }

  // File Handlers
  const handleAssetFileSelect = e => {
    const file = e.target.files?.[0]
    if (!file) return
    setLocalAssetFile(file)
    const url = URL.createObjectURL(file)
    setLocalAssetPreviewUrl(url)

    // For dealer or avatar frame, suggest opening cropper
    if (catCode === 'DEALER' || catCode === 'FRAME') {
      setCropperSource(url)
      setShowCropperModal(true)
    }
  }

  const handleVideoFileSelect = e => {
    const file = e.target.files?.[0]
    if (!file) return
    setLocalVideoFile(file)
    setLocalVideoPreviewUrl(URL.createObjectURL(file))
  }

  const handleSoundFileSelect = e => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 2 * 1024 * 1024) {
      notify('Tệp âm thanh không được vượt quá 2MB', { type: 'error' })
      return
    }
    setLocalSoundFile(file)
    const url = URL.createObjectURL(file)
    setLocalSoundPreviewUrl(url)
    if (audioRef.current) {
      audioRef.current.pause()
      setIsPlayingAudio(false)
    }
  }

  const handleTogglePlayAudio = () => {
    if (!localSoundPreviewUrl) return
    if (!audioRef.current) {
      audioRef.current = new Audio(localSoundPreviewUrl)
      audioRef.current.onended = () => setIsPlayingAudio(false)
    }
    if (isPlayingAudio) {
      audioRef.current.pause()
      audioRef.current.currentTime = 0
      setIsPlayingAudio(false)
    } else {
      audioRef.current.src = localSoundPreviewUrl
      audioRef.current
        .play()
        .then(() => setIsPlayingAudio(true))
        .catch(() => setIsPlayingAudio(false))
    }
  }

  const handleZipFileSelect = e => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedZipFile(file)
  }

  const handleMultiFilesSelect = e => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setSelectedImageFiles(files)
    }
  }

  // Handle Cropper Result
  const handleCropComplete = (croppedFile, dataUrl) => {
    setLocalAssetFile(croppedFile)
    setLocalAssetPreviewUrl(dataUrl)
    notify('Đã cắt và căn khung ảnh thành công!', { type: 'success' })
  }

  // Submit Handler
  const handleSubmit = async e => {
    e.preventDefault()
    if (!name.trim()) {
      notify('Vui lòng nhập tên sản phẩm', { type: 'error' })
      return
    }
    if (!selectedCategoryId) {
      notify('Vui lòng chọn danh mục cho sản phẩm', { type: 'error' })
      return
    }

    setIsSubmitting(true)
    try {
      let finalAssetUrl = manualAssetUrl.trim()
      let finalVideoUrl = manualVideoUrl.trim()

      // 1. Upload local asset file to S3 if selected
      if (localAssetFile) {
        setSubmitStep('Đang tải lên tệp tài nguyên lên S3...')
        const res = await uploadAssetFile(localAssetFile, 'assets')
        if (res?.data?.url) {
          finalAssetUrl = res.data.url
        }
      }

      // 2. Upload local video file to S3 if selected
      if (localVideoFile) {
        setSubmitStep('Đang tải lên video review lên S3...')
        const res = await uploadAssetFile(localVideoFile, 'videos')
        if (res?.data?.url) {
          finalVideoUrl = res.data.url
        }
      }

      // 3. Fallback defaults if no asset provided
      if (!finalAssetUrl) {
        if (catCode === 'CARD_SKIN') {
          finalAssetUrl = 'https://assets.msspoker.com/cards/gold_black/back.png'
        } else if (catCode === 'TABLE') {
          finalAssetUrl = 'https://assets.msspoker.com/tables/classic_green.png'
        } else {
          finalAssetUrl = 'https://assets.msspoker.com/placeholders/cosmetic.png'
        }
      }

      // 4. Create Product
      setSubmitStep('Đang khởi tạo bản ghi sản phẩm...')
      const productPayload = {
        name: name.trim(),
        categoryId: selectedCategoryId,
        description: description.trim(),
        tier,
        priceVnd,
        priceVipCoin,
        isExclusive,
        assetUrl: finalAssetUrl,
        previewVideoUrl: finalVideoUrl || null,
        saleExpiresAt: computedSaleExpiresAt,
      }

      const created = await createProduct(productPayload)
      const productId = created?.id

      if (!productId) {
        throw new Error('Không nhận được ID sản phẩm sau khi tạo')
      }

      // 5. Upload Sound if provided
      if (localSoundFile) {
        setSubmitStep('Đang tải lên và liên kết tệp âm thanh...')
        await uploadProductSound(productId, localSoundFile)
      }

      // 6. Ingest Card Skin if CARD_SKIN
      if (catCode === 'CARD_SKIN') {
        if (selectedZipFile) {
          setSubmitStep('Đang giải nén và tải lên bộ bài 52 lá...')
          await uploadDeckSkinZip(productId, selectedZipFile)
        } else if (selectedImageFiles.length > 0) {
          setSubmitStep('Đang tải lên các lá bài rời...')
          await uploadDeckSkinFiles(productId, selectedImageFiles)
        }
      }

      notify(`Tạo sản phẩm "${name}" thành công!`, { type: 'success' })
      onSuccess?.()
    } catch (err) {
      notify(err.message || 'Lỗi khi tạo sản phẩm', { type: 'error' })
    } finally {
      setIsSubmitting(false)
      setSubmitStep('')
    }
  }

  // Category Icon helper
  const getCatIcon = code => {
    switch (code) {
      case 'DEALER': return 'face'
      case 'CARD_SKIN': return 'style'
      case 'TABLE': return 'crop_16_9'
      case 'FRAME': return 'account_circle'
      case 'SOUND': return 'volume_up'
      case 'ALL_IN_EFFECT':
      case 'VICTORY_EFFECT': return 'auto_awesome'
      default: return 'category'
    }
  }

  return (
    <div className="space-y-6 animate-fade-in text-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-wrap gap-4">
        <div>
          <h2 className="font-headline font-black text-xl text-white flex items-center gap-2">
            <Icon name="add_circle" className="text-amber-400 text-2xl" />
            <span>Thêm Mới Vật Phẩm & Skin Vào Cửa Hàng</span>
          </h2>
          <p className="text-xs text-white/50">
            Form động tự điều chỉnh theo danh mục • Chọn file trực tiếp từ máy tính (S3 Ingestion khi Lưu)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Hủy Bỏ
          </Button>
          <Button
            variant="gold"
            size="sm"
            icon="publish"
            loading={isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? (submitStep || 'Đang Xử Lý...') : 'Lưu Sản Phẩm Ngay'}
          </Button>
        </div>
      </div>

      {/* Main Form Layout (8 cols form + 4 cols sticky preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Dynamic Form Fields */}
        <div className="lg:col-span-8 space-y-6">
          {/* Step 1: Chọn Danh Mục & Thông Tin Cơ Bản */}
          <div className="p-6 rounded-3xl bg-[#140a24]/95 border border-white/10 shadow-xl space-y-4">
            <h3 className="font-headline font-bold text-base text-white flex items-center gap-2 pb-3 border-b border-white/10">
              <Icon name="category" className="text-amber-400 text-xl" />
              <span>1. Chọn Danh Mục & Thông Tin Nhận Diện</span>
            </h3>

            {/* Row 1: Category Selector (Priority at Top) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-white/80">
                    Danh mục hiển thị: <span className="text-amber-400">*</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowAddCategoryModal(true)}
                    className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors px-2 py-0.5 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30"
                  >
                    <Icon name="add" className="text-sm" />
                    <span>+ Thêm danh mục mới</span>
                  </button>
                </div>
                <div className="relative">
                  <select
                    value={selectedCategoryId}
                    onChange={e => setSelectedCategoryId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-[#1b0d36] border border-amber-400/40 text-sm font-bold text-white focus:outline-none focus:border-amber-400 transition-colors cursor-pointer"
                  >
                    {categories.map(c => (
                      <option key={c.id || c.code} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                  <Icon
                    name={getCatIcon(catCode)}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400 text-lg pointer-events-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-white/80 block mb-1.5">
                  Tên sản phẩm mở bán: <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Cô Em Chia Bài Sexy Nơ Hồng, Bàn Dạ Quang..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-black/50 border border-white/15 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>
            </div>

            {/* Row 2: Tier Pills */}
            <div>
              <label className="text-xs font-bold text-white/80 block mb-1.5">
                Phân hạng vật phẩm (Tier):
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'NORMAL', label: 'STANDARD', desc: 'Vật phẩm phổ thông' },
                  { id: 'VIP', label: 'VIP', desc: 'Hiệu ứng & Ánh kim' },
                  { id: 'SUPER_VIP', label: 'SUPER VIP', desc: 'Huyền thoại tối thượng' },
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTier(t.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      tier === t.id
                        ? 'bg-amber-400/15 border-amber-400 text-amber-300 shadow-md shadow-amber-500/10'
                        : 'bg-black/30 border-white/10 text-white/60 hover:border-white/20'
                    }`}
                  >
                    <span className="font-headline font-black text-xs block">{t.label}</span>
                    <span className="text-[10px] text-white/40 block mt-0.5">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Row 3: Description */}
            <div>
              <label className="text-xs font-bold text-white/80 block mb-1.5">
                Mô tả chi tiết hiển thị trong Shop:
              </label>
              <textarea
                rows={2}
                maxLength={300}
                placeholder="Mô tả phong cách thiết kế, chất liệu, tính năng độc quyền..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-black/50 border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          {/* Step 2: Dynamic Asset Upload Area (Dựa theo Category) */}
          <div className="p-6 rounded-3xl bg-[#140a24]/95 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-headline font-bold text-base text-white flex items-center gap-2">
                <Icon name="upload_file" className="text-amber-400 text-xl" />
                <span>2. Tải Lên Tệp Tài Nguyên Cho:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-black">
                  {currentCategory?.name || 'Vật Phẩm'} ({catCode})
                </span>
              </h3>
              <span className="text-[11px] text-white/50">Chọn trực tiếp từ máy tính</span>
            </div>

            {/* Case A: CARD_SKIN */}
            {catCode === 'CARD_SKIN' && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 p-1.5 bg-black/40 rounded-2xl border border-white/10 max-w-md">
                  <button
                    type="button"
                    onClick={() => setDeckMethod('ZIP')}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      deckMethod === 'ZIP'
                        ? 'bg-amber-400 text-slate-950 shadow-md'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    File ZIP (52/53 Lá Nhanh)
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeckMethod('FILES')}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      deckMethod === 'FILES'
                        ? 'bg-amber-400 text-slate-950 shadow-md'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    Tải Danh Sách Ảnh Rời
                  </button>
                </div>

                {deckMethod === 'ZIP' ? (
                  <div className="border-2 border-dashed border-amber-400/40 hover:border-amber-400 rounded-3xl p-6 text-center bg-black/30 transition-all">
                    <input
                      type="file"
                      accept=".zip"
                      id="ctrl-panel-zip"
                      onChange={handleZipFileSelect}
                      className="hidden"
                    />
                    <label htmlFor="ctrl-panel-zip" className="cursor-pointer flex flex-col items-center">
                      <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-3 shadow-inner">
                        <Icon name="folder_zip" className="text-3xl" />
                      </div>
                      <span className="text-sm font-bold text-white">
                        {selectedZipFile ? selectedZipFile.name : 'Nhấp để chọn file ZIP 52 lá bài từ máy tính'}
                      </span>
                      <span className="text-xs text-white/50 mt-1 max-w-md">
                        {selectedZipFile
                          ? `Dung lượng: ${(selectedZipFile.size / 1024).toFixed(1)} KB • Sẵn sàng nạp S3 khi bấm Lưu`
                          : 'File ZIP chứa 52 lá mặt trước (2H.png, AS.png...) và 1 lá mặt sau (back.png).'}
                      </span>
                      {selectedZipFile && (
                        <span className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                          <Icon name="check_circle" className="text-sm" /> Đã chọn file ZIP
                        </span>
                      )}
                    </label>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-white/20 hover:border-amber-400 rounded-3xl p-6 text-center bg-black/30 transition-all">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      id="ctrl-panel-files"
                      onChange={handleMultiFilesSelect}
                      className="hidden"
                    />
                    <label htmlFor="ctrl-panel-files" className="cursor-pointer flex flex-col items-center">
                      <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white/60 mb-3">
                        <Icon name="photo_library" className="text-3xl" />
                      </div>
                      <span className="text-sm font-bold text-white">
                        {selectedImageFiles.length > 0
                          ? `Đã chọn ${selectedImageFiles.length} ảnh lá bài`
                          : 'Bấm để chọn nhiều file ảnh lá bài (2H.png, AS.png...)'}
                      </span>
                    </label>
                  </div>
                )}
              </div>
            )}

            {/* Case B: SOUND */}
            {catCode === 'SOUND' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-purple-500/40 hover:border-purple-400 rounded-3xl p-6 text-center bg-black/30 transition-all">
                  <input
                    type="file"
                    accept="audio/mp3,audio/wav,audio/ogg"
                    id="ctrl-panel-sound"
                    onChange={handleSoundFileSelect}
                    className="hidden"
                  />
                  <label htmlFor="ctrl-panel-sound" className="cursor-pointer flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-3 shadow-inner">
                      <Icon name="volume_up" className="text-3xl" />
                    </div>
                    <span className="text-sm font-bold text-white">
                      {localSoundFile ? localSoundFile.name : 'Chọn tệp âm thanh hiệu ứng (MP3, WAV, OGG)'}
                    </span>
                    <span className="text-xs text-white/50 mt-1">
                      {localSoundFile
                        ? `Dung lượng: ${(localSoundFile.size / 1024).toFixed(1)} KB • Có thể nghe thử ngay bên dưới`
                        : 'Dung lượng tối đa 2MB. Dùng cho tiếng lật bài, all-in, trêu đùa hoặc âm thanh Dealer.'}
                    </span>
                  </label>
                </div>

                {/* Audio Player Preview */}
                {localSoundPreviewUrl && (
                  <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleTogglePlayAudio}
                        className="w-10 h-10 rounded-full bg-purple-500 hover:bg-purple-400 text-slate-950 flex items-center justify-center shadow-lg transition-transform active:scale-95"
                      >
                        <Icon name={isPlayingAudio ? 'pause' : 'play_arrow'} className="text-xl" />
                      </button>
                      <div>
                        <span className="text-xs font-bold text-purple-300 block">
                          {localSoundFile?.name}
                        </span>
                        <span className="text-[11px] text-white/50">
                          {isPlayingAudio ? 'Đang phát...' : 'Nhấn để nghe thử trực tiếp'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setLocalSoundFile(null)
                        setLocalSoundPreviewUrl('')
                        setIsPlayingAudio(false)
                      }}
                      className="text-xs text-rose-400 hover:text-rose-300 font-bold"
                    >
                      Xóa tệp
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Case C: DEALER */}
            {catCode === 'DEALER' && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-amber-400/40 hover:border-amber-400 rounded-3xl p-6 text-center bg-black/30 transition-all">
                  <input
                    type="file"
                    accept="image/*"
                    id="ctrl-panel-dealer"
                    onChange={handleAssetFileSelect}
                    className="hidden"
                  />
                  <label htmlFor="ctrl-panel-dealer" className="cursor-pointer flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-3 shadow-inner">
                      <Icon name="face" className="text-3xl" />
                    </div>
                    <span className="text-sm font-bold text-white">
                      {localAssetFile ? localAssetFile.name : 'Bấm để tải ảnh chân dung Người chia bài (Dealer)'}
                    </span>
                    <span className="text-xs text-white/50 mt-1">
                      Hỗ trợ PNG, JPEG, WebP. Khuyên dùng ảnh chụp từ ngực trở lên để làm Avatar tròn hoàn hảo.
                    </span>
                  </label>
                </div>

                {/* Cropper Trigger & Preview */}
                {localAssetPreviewUrl && (
                  <div className="p-4 rounded-2xl bg-black/40 border border-amber-400/30 flex items-center justify-between flex-wrap gap-3">
                    <div className="flex items-center gap-3.5">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-amber-400 shadow-md bg-black">
                        <img
                          src={localAssetPreviewUrl}
                          alt="Dealer Cropped Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-amber-300 block">
                          Ảnh đại diện Dealer đã sẵn sàng
                        </span>
                        <span className="text-[11px] text-white/50">
                          Ảnh này sẽ xuất hiện trên bàn chơi và Shop
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="secondary"
                      size="sm"
                      icon="crop"
                      onClick={() => {
                        setCropperSource(localAssetPreviewUrl)
                        setShowCropperModal(true)
                      }}
                      className="border-amber-400/40 text-amber-300 hover:bg-amber-400/10"
                    >
                      Cắt & Căn Chỉnh Khung Hình (Crop 1:1)
                    </Button>
                  </div>
                )}
              </div>
            )}

            {/* Case D, E, F & Generic: TABLE, EFFECT, FRAME, ETC */}
            {catCode !== 'CARD_SKIN' && catCode !== 'SOUND' && catCode !== 'DEALER' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Asset File (Texture, Sprite, Frame) */}
                  <div className="border-2 border-dashed border-white/20 hover:border-amber-400 rounded-3xl p-5 text-center bg-black/30 transition-all flex flex-col justify-center items-center">
                    <input
                      type="file"
                      accept="image/*"
                      id="ctrl-panel-generic-asset"
                      onChange={handleAssetFileSelect}
                      className="hidden"
                    />
                    <label htmlFor="ctrl-panel-generic-asset" className="cursor-pointer flex flex-col items-center">
                      <Icon name="image" className="text-3xl text-amber-400 mb-2" />
                      <span className="text-xs font-bold text-white block">
                        {localAssetFile ? localAssetFile.name : 'Tải ảnh tài nguyên (Texture / Frame / Icon)'}
                      </span>
                      <span className="text-[10px] text-white/50 mt-1">Chọn từ máy tính (PNG, JPG, WebP)</span>
                    </label>
                  </div>

                  {/* Video Review File (Optional for Effects / Tables) */}
                  <div className="border-2 border-dashed border-white/20 hover:border-amber-400 rounded-3xl p-5 text-center bg-black/30 transition-all flex flex-col justify-center items-center">
                    <input
                      type="file"
                      accept="video/mp4,video/webm"
                      id="ctrl-panel-generic-video"
                      onChange={handleVideoFileSelect}
                      className="hidden"
                    />
                    <label htmlFor="ctrl-panel-generic-video" className="cursor-pointer flex flex-col items-center">
                      <Icon name="videocam" className="text-3xl text-cyan-400 mb-2" />
                      <span className="text-xs font-bold text-white block">
                        {localVideoFile ? localVideoFile.name : 'Tải Video Review (MP4, WebM)'}
                      </span>
                      <span className="text-[10px] text-white/50 mt-1">Tùy chọn - Hiển thị demo chuyển động</span>
                    </label>
                  </div>
                </div>

                {/* Video Player Preview if selected */}
                {localVideoPreviewUrl && (
                  <div className="p-3 rounded-2xl bg-black/50 border border-cyan-400/30 space-y-2">
                    <span className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                      <Icon name="play_circle" className="text-sm" />
                      Xem thử Video Review:
                    </span>
                    <video
                      src={localVideoPreviewUrl}
                      controls
                      autoPlay
                      loop
                      muted
                      className="w-full max-h-48 rounded-xl object-contain bg-black"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Step 3: Thiết Lập Giá Bán & Quyền Sở Hữu */}
          <div className="p-6 rounded-3xl bg-[#140a24]/95 border border-white/10 shadow-xl space-y-4">
            <h3 className="font-headline font-bold text-base text-white flex items-center gap-2 pb-3 border-b border-white/10">
              <Icon name="monetization_on" className="text-amber-400 text-xl" />
              <span>3. Thiết Lập Giá Bán & Quyền Sở Hữu</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-white/80 block mb-1.5">
                  Giá VIP Coin (Trong Game):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={priceVipCoin}
                    onChange={e => handlePriceVipCoinChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/50 border border-white/15 text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                  />
                  <Icon
                    name="paid"
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400 text-lg pointer-events-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-white/80 block mb-1.5">
                  Giá niêm yết tương đương (VNĐ):
                </label>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={priceVnd}
                  onChange={e => handlePriceVndChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-black/50 border border-white/15 text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                />
                <span className="text-[11px] text-white/40 mt-1 block">
                  Quy đổi: {formatVnd(priceVnd)}
                </span>
              </div>
            </div>

            {/* Quick Price Presets */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-xs text-white/40">Mức giá gợi ý:</span>
              {[
                { vip: 30, vnd: 30000, label: '30 VIP (30K)' },
                { vip: 50, vnd: 50000, label: '50 VIP (50K)' },
                { vip: 100, vnd: 100000, label: '100 VIP (100K)' },
                { vip: 150, vnd: 150000, label: '150 VIP (150K)' },
              ].map(p => (
                <button
                  key={p.vip}
                  type="button"
                  onClick={() => {
                    setPriceVipCoin(p.vip)
                    setPriceVnd(p.vnd)
                  }}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border transition-all ${
                    priceVipCoin === p.vip
                      ? 'bg-amber-400 text-slate-950 border-amber-400'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Flash sale settings */}
            <div className="space-y-3 pt-3 border-t border-white/10">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="flash-sale-chk"
                  checked={isFlashSale}
                  onChange={e => setIsFlashSale(e.target.checked)}
                  className="mt-1 rounded accent-amber-400 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="flash-sale-chk" className="text-xs text-white/90 cursor-pointer">
                  <strong className="text-amber-300 flex items-center gap-1.5 inline-flex">
                    <Icon name="bolt" className="text-amber-400 text-sm" />
                    Mở Bán Giới Hạn Thời Gian (Flash Sale Độc Quyền)
                  </strong>
                  <span className="block text-white/50 text-[11px] mt-0.5">
                    Hết thời hạn đếm ngược, Scheduler hệ thống sẽ tự động khóa và ngắt bán sản phẩm này.
                  </span>
                </label>
              </div>

              {isFlashSale && (
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-400/30 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Icon name="timer" className="text-base" />
                      Thời Hạn Mở Bán:
                    </span>
                    <span className="text-[11px] text-white/60 font-mono">
                      Hết hạn: {computedSaleExpiresAt ? new Date(computedSaleExpiresAt).toLocaleString() : 'Chưa thiết lập'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                    {[
                      { id: '12_HOURS', label: '12 Giờ' },
                      { id: '1_DAY', label: '1 Ngày' },
                      { id: '2_DAYS', label: '2 Ngày' },
                      { id: '3_DAYS', label: '3 Ngày' },
                      { id: '7_DAYS', label: '7 Ngày' },
                      { id: 'CUSTOM', label: 'Tùy Chọn' },
                    ].map(opt => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => setFlashSalePreset(opt.id)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all text-center ${
                          flashSalePreset === opt.id
                            ? 'bg-amber-400 text-slate-950 border-amber-400 shadow-sm shadow-amber-500/20'
                            : 'bg-black/40 border-white/10 text-white/70 hover:border-white/20'
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {flashSalePreset === 'CUSTOM' && (
                    <div className="pt-2">
                      <input
                        type="datetime-local"
                        value={customSaleExpiresAt}
                        onChange={e => setCustomSaleExpiresAt(e.target.value)}
                        className="w-full sm:w-72 px-3 py-2 rounded-xl bg-black/60 border border-amber-400/30 text-xs text-amber-300 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Live Preview & Summary Card */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          <div className="p-6 rounded-3xl bg-[#140a24]/95 border border-white/10 shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h4 className="font-headline font-bold text-sm text-white flex items-center gap-2">
                <Icon name="preview" className="text-amber-400 text-lg" />
                <span>Xem Trước Hiển Thị Shop</span>
              </h4>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-amber-400/20 text-amber-300">
                Live Preview
              </span>
            </div>

            {/* Stage Preview */}
            <div className="w-full aspect-[4/3] rounded-2xl bg-black/60 border border-white/10 p-3 flex flex-col items-center justify-center relative overflow-hidden">
              <CosmeticRenderer
                categoryCode={catCode}
                previewUrl={localAssetPreviewUrl || manualAssetUrl}
                assetUrl={localAssetPreviewUrl || manualAssetUrl}
                productName={name}
                rank="A"
                suit="S"
                interactive
              />
              <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/60 text-white/80 border border-white/10">
                {currentCategory?.name || 'Vật phẩm'}
              </span>
            </div>

            {/* Product Meta Summary */}
            <div className="space-y-2 text-xs border-t border-white/10 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-white/50">Tên sản phẩm:</span>
                <span className="font-bold text-white truncate max-w-[180px]">
                  {name || 'Chưa đặt tên'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">Phân hạng Tier:</span>
                <span className="font-bold text-amber-400">{tier}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">Giá VIP Coin:</span>
                <span className="font-bold text-amber-300 font-mono">
                  {formatVipCoin(priceVipCoin)} VIP
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">Quy đổi VNĐ:</span>
                <span className="font-bold text-white/80 font-mono">
                  {formatVnd(priceVnd)}
                </span>
              </div>
            </div>

            {/* Submit Action in sticky sidebar */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <Button
                variant="gold"
                size="lg"
                icon="publish"
                loading={isSubmitting}
                onClick={handleSubmit}
                className="w-full justify-center"
              >
                {isSubmitting ? (submitStep || 'Đang Xử Lý...') : 'Lưu Sản Phẩm Ngay'}
              </Button>
              <Button
                variant="secondary"
                size="md"
                disabled={isSubmitting}
                onClick={onCancel}
                className="w-full justify-center"
              >
                Hủy Bỏ
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal tạo Category mới */}
      <AddCategoryModal
        isOpen={showAddCategoryModal}
        onClose={() => setShowAddCategoryModal(false)}
        onSuccess={newCat => {
          onRefreshCategories?.()
          if (newCat?.id) {
            setSelectedCategoryId(newCat.id)
          }
        }}
      />

      {/* Modal Cắt Ảnh (Image Cropper) */}
      <ImageCropperModal
        isOpen={showCropperModal}
        imageSrc={cropperSource}
        cropShape={catCode === 'DEALER' || catCode === 'FRAME' ? 'circle' : 'square'}
        onClose={() => setShowCropperModal(false)}
        onCropComplete={handleCropComplete}
      />
    </div>
  )
}
