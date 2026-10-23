import { useState, useMemo } from 'react'
import { Icon, Button, useToast } from '@/shared/ui'
import { formatVipCoin, formatVnd } from '../utils/adminFormatters'
import CosmeticRenderer from '@/features/shop/components/CosmeticRenderer'

export default function AddProductControlPanel({
  categories = [],
  createProduct,
  uploadDeckSkinZip,
  uploadDeckSkinFiles,
  onSuccess,
  onCancel,
}) {
  const notify = useToast()

  // Mode: 'STANDARD' (Cosmetic items like felts, avatars, vfx) vs 'CARD_SKIN' (Card deck skins)
  const [productType, setProductType] = useState('STANDARD')

  // Form Fields
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [tier, setTier] = useState('VIP')
  const [priceVnd, setPriceVnd] = useState(50000)
  const [priceVipCoin, setPriceVipCoin] = useState(50)
  const [isExclusive, setIsExclusive] = useState(false)
  const [assetUrl, setAssetUrl] = useState('')
  const [previewVideoUrl, setPreviewVideoUrl] = useState('')

  // Card Skin specific options
  const [deckOption, setDeckOption] = useState('CARD_FACE') // 'CARD_FACE' | 'CARD_BACK'
  const [ingestionMethod, setIngestionMethod] = useState('ZIP') // 'ZIP' | 'FILES' | 'URL'
  const [selectedZipFile, setSelectedZipFile] = useState(null)
  const [selectedImageFiles, setSelectedImageFiles] = useState([])

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStep, setSubmitStep] = useState('')

  // Find or fallback category
  const cardCategories = useMemo(() => {
    return categories.filter(
      c =>
        c.code.includes('CARD') ||
        c.code.includes('DECK') ||
        c.name.toLowerCase().includes('bài')
    )
  }, [categories])

  const defaultCategory = useMemo(() => {
    if (productType === 'CARD_SKIN') {
      const match = categories.find(c => c.code === deckOption)
      return match || cardCategories[0] || categories[0]
    }
    const nonCard = categories.filter(
      c =>
        !c.code.includes('CARD') &&
        !c.code.includes('DECK') &&
        !c.name.toLowerCase().includes('bài')
    )
    return nonCard[0] || categories[0]
  }, [productType, deckOption, categories, cardCategories])

  const [selectedCategoryId, setSelectedCategoryId] = useState(
    defaultCategory?.id || ''
  )

  // Auto-sync category when productType or deckOption changes
  const handleTypeChange = newType => {
    setProductType(newType)
    if (newType === 'CARD_SKIN') {
      const targetCode = deckOption || 'CARD_FACE'
      const cat = categories.find(c => c.code === targetCode) || cardCategories[0] || categories[0]
      if (cat) setSelectedCategoryId(cat.id)
      if (!name) setName('Bộ Bài Hoàng Gia Hắc Kim')
      if (!description) setDescription('Bộ bài nghệ thuật 52 lá dát vàng sang trọng kèm hiệu ứng lật bài độc quyền.')
      if (!assetUrl) setAssetUrl('https://assets.msspoker.com/cards/gold_black/back.png')
    } else {
      const cat = categories.find(c => !c.code.includes('CARD')) || categories[0]
      if (cat) setSelectedCategoryId(cat.id)
      if (name.includes('Bộ Bài')) setName('')
    }
  }

  const handleDeckOptionChange = newOption => {
    setDeckOption(newOption)
    const cat = categories.find(c => c.code === newOption) || cardCategories[0]
    if (cat) setSelectedCategoryId(cat.id)
  }

  // Price synchronization helper
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

  // Handle Drag & Drop ZIP
  const handleZipDrop = e => {
    e.preventDefault()
    const file = e.dataTransfer?.files?.[0]
    if (file) {
      if (!file.name.toLowerCase().endsWith('.zip')) {
        notify('Vui lòng chọn file nén định dạng .zip!', { type: 'error' })
        return
      }
      setSelectedZipFile(file)
    }
  }

  // Handle File change
  const handleZipFileSelect = e => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.name.toLowerCase().endsWith('.zip')) {
        notify('Vui lòng chọn file nén định dạng .zip!', { type: 'error' })
        return
      }
      setSelectedZipFile(file)
    }
  }

  const handleMultiFilesSelect = e => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setSelectedImageFiles(files)
      notify(`Đã chọn ${files.length} ảnh lá bài.`, { type: 'info' })
    }
  }

  // Submit Handler
  const handleSubmit = async e => {
    e.preventDefault()
    if (!name.trim()) {
      notify('Vui lòng nhập tên sản phẩm!', { type: 'error' })
      return
    }

    const categoryObj =
      categories.find(c => c.id === selectedCategoryId) || defaultCategory
    if (!categoryObj) {
      notify('Vui lòng chọn danh mục hợp lệ!', { type: 'error' })
      return
    }

    setIsSubmitting(true)
    setSubmitStep('Đang khởi tạo thông tin sản phẩm...')

    try {
      // 1. Create Product in DB
      const payload = {
        categoryId: categoryObj.id,
        name: name.trim(),
        description: description.trim(),
        tier,
        priceVnd: Number(priceVnd),
        priceVipCoin: Number(priceVipCoin),
        assetUrl:
          assetUrl.trim() ||
          (productType === 'CARD_SKIN'
            ? 'https://assets.msspoker.com/cards/cyber/back.png'
            : 'https://assets.msspoker.com/cosmetics/default_preview.png'),
        previewVideoUrl: previewVideoUrl.trim() || null,
        isExclusive,
      }

      const res = await createProduct(payload)
      const createdProduct = res?.data
      const newProductId = createdProduct?.id

      // 2. If Card Skin with ZIP file -> Upload directly to S3
      if (
        productType === 'CARD_SKIN' &&
        newProductId &&
        ingestionMethod === 'ZIP' &&
        selectedZipFile
      ) {
        setSubmitStep('Đang giải nén & nạp 53 lá bài lên S3 / MinIO...')
        await uploadDeckSkinZip(newProductId, selectedZipFile)
        notify(
          `Đã tạo sản phẩm và nạp thành công 53 lá bài cho "${name}"!`,
          { type: 'success' }
        )
      } else if (
        productType === 'CARD_SKIN' &&
        newProductId &&
        ingestionMethod === 'FILES' &&
        selectedImageFiles.length > 0
      ) {
        setSubmitStep(`Đang tải lên ${selectedImageFiles.length} file ảnh lên S3...`)
        await uploadDeckSkinFiles(newProductId, selectedImageFiles)
        notify(
          `Đã tạo sản phẩm và nạp ${selectedImageFiles.length} ảnh lá bài thành công!`,
          { type: 'success' }
        )
      } else {
        notify(`Tạo sản phẩm "${name}" thành công!`, { type: 'success' })
      }

      onSuccess?.()
    } catch (err) {
      notify(err.message || 'Thao tác tạo sản phẩm thất bại', { type: 'error' })
    } finally {
      setIsSubmitting(false)
      setSubmitStep('')
    }
  }

  const selectedCategoryObj =
    categories.find(c => c.id === selectedCategoryId) || defaultCategory

  return (
    <div className="space-y-6">
      {/* Top Banner & Breadcrumb Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#170a2c] via-[#150926] to-[#0c0418] border border-white/10 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />

        <div className="flex items-center gap-4 relative z-10">
          <button
            type="button"
            onClick={onCancel}
            className="w-10 h-10 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all shadow-md shrink-0"
            title="Quay lại danh sách"
          >
            <Icon name="arrow_back" className="text-xl" />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-amber-400 text-slate-950 shadow-sm">
                Control Panel
              </span>
              <span className="text-xs text-white/40">• Bảng Điều Khiển Quản Trị</span>
            </div>
            <h2 className="font-headline font-black text-2xl text-white">
              Thêm Vật Phẩm Mới & Cấu Hình Skin Bài
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <Button
            variant="secondary"
            size="md"
            icon="close"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            Hủy Bỏ
          </Button>
          <Button
            variant="gold"
            size="md"
            icon="publish"
            loading={isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? (submitStep || 'Đang Xử Lý...') : 'Lưu & Kích Hoạt Shop'}
          </Button>
        </div>
      </div>

      {/* Product Type Selector: 2 Big Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: Standard Cosmetic */}
        <div
          onClick={() => handleTypeChange('STANDARD')}
          className={`cursor-pointer p-5 rounded-3xl border transition-all relative overflow-hidden flex items-start gap-4 ${
            productType === 'STANDARD'
              ? 'bg-[#1b0d36] border-amber-400/80 shadow-lg shadow-amber-500/10'
              : 'bg-[#120822]/70 border-white/10 hover:border-white/20 hover:bg-[#160b2b]'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
              productType === 'STANDARD'
                ? 'bg-amber-400 text-slate-950 font-black'
                : 'bg-white/10 text-white/70'
            }`}
          >
            <Icon name="palette" className="text-2xl" />
          </div>
          <div className="flex-grow min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="font-headline font-black text-base text-white">
                Vật Phẩm Trang Trí Tiêu Chuẩn
              </h4>
              {productType === 'STANDARD' && (
                <span className="text-amber-400 text-sm font-bold flex items-center gap-1">
                  <Icon name="check_circle" className="text-base" /> Đang Chọn
                </span>
              )}
            </div>
            <p className="text-xs text-white/60 mt-1 leading-relaxed">
              Khung Avatar danh giá, Bàn chơi poker bọc nhung, Hiệu ứng All-in rực lửa, Biểu cảm emoji & Âm thanh.
            </p>
          </div>
        </div>

        {/* Card 2: Card Deck Skin */}
        <div
          onClick={() => handleTypeChange('CARD_SKIN')}
          className={`cursor-pointer p-5 rounded-3xl border transition-all relative overflow-hidden flex items-start gap-4 ${
            productType === 'CARD_SKIN'
              ? 'bg-[#1b0d36] border-amber-400/80 shadow-lg shadow-amber-500/10 ring-2 ring-amber-400/30'
              : 'bg-[#120822]/70 border-white/10 hover:border-white/20 hover:bg-[#160b2b]'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
              productType === 'CARD_SKIN'
                ? 'bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black'
                : 'bg-white/10 text-white/70'
            }`}
          >
            <Icon name="style" className="text-2xl" />
          </div>
          <div className="flex-grow min-w-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="font-headline font-black text-base text-white">
                  Bộ Skin Lá Bài Tây (52/53 Lá)
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Hỗ Trợ ZIP
                </span>
              </div>
              {productType === 'CARD_SKIN' && (
                <span className="text-amber-400 text-sm font-bold flex items-center gap-1">
                  <Icon name="check_circle" className="text-base" /> Đang Chọn
                </span>
              )}
            </div>
            <p className="text-xs text-white/60 mt-1 leading-relaxed">
              Tạo skin bộ bài tây, nạp file ZIP 53 lá tự động unpack sang S3, tạo Texture Atlas & hỗ trợ xem 3D tương tác.
            </p>
          </div>
        </div>
      </div>

      {/* Main Two-Column Control Panel Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Form Controls */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Thông tin cơ bản */}
          <div className="p-6 rounded-3xl bg-[#140a24]/95 border border-white/10 shadow-xl space-y-4">
            <h3 className="font-headline font-bold text-base text-white flex items-center gap-2 pb-3 border-b border-white/10">
              <Icon name="edit_note" className="text-amber-400 text-xl" />
              <span>1. Thông Tin Nhận Diện Sản Phẩm</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-white/70 block mb-1.5">
                  Tên sản phẩm: <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Bộ Bài Hoàng Gia Hắc Kim, Bàn Chơi Dạ Quang..."
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-black/50 border border-white/15 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400 transition-colors"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/70 block mb-1.5">
                  Danh mục hiển thị: <span className="text-rose-400">*</span>
                </label>
                <select
                  value={selectedCategoryId}
                  onChange={e => setSelectedCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-[#1b0d36] border border-white/15 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                >
                  {categories.map(c => (
                    <option key={c.id || c.code} value={c.id}>
                      {c.name} ({c.code})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tier Selector Pills */}
            <div>
              <label className="text-xs font-bold text-white/70 block mb-1.5">
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
                        ? t.id === 'SUPER_VIP'
                          ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-md shadow-amber-500/20'
                          : t.id === 'VIP'
                          ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                          : 'bg-white/15 border-white/30 text-white'
                        : 'bg-black/30 border-white/10 text-white/60 hover:border-white/20'
                    }`}
                  >
                    <div className="font-headline font-black text-xs tracking-wider">
                      {t.label}
                    </div>
                    <div className="text-[11px] opacity-75 mt-0.5">{t.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold text-white/70 block mb-1.5">
                Mô tả chi tiết:
              </label>
              <textarea
                rows={3}
                placeholder="Mô tả phong cách thiết kế, chất liệu, hiệu ứng ánh sáng hoặc âm thanh kèm theo..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-black/50 border border-white/15 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400 transition-colors"
              />
            </div>
          </div>

          {/* Section 2: Card Skin Special Options (Hiển thị khi chọn Card Skin) */}
          {productType === 'CARD_SKIN' && (
            <div className="p-6 rounded-3xl bg-[#140a24]/95 border border-amber-400/30 shadow-xl space-y-4 relative">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="font-headline font-bold text-base text-amber-300 flex items-center gap-2">
                  <Icon name="filter_frames" className="text-xl" />
                  <span>2. Cấu Hình Bộ Skin Lá Bài Tây (52/53 Lá)</span>
                </h3>
                <span className="text-xs text-white/50">Quy chuẩn S3 / MinIO</span>
              </div>

              {/* Deck Option: Face vs Back */}
              <div>
                <label className="text-xs font-bold text-white/70 block mb-1.5">
                  Phân loại bộ bài:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleDeckOptionChange('CARD_FACE')}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                      deckOption === 'CARD_FACE'
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-md'
                        : 'bg-black/30 border-white/10 text-white/60 hover:border-white/20'
                    }`}
                  >
                    <Icon name="style" className="text-2xl shrink-0" />
                    <div>
                      <div className="font-bold text-xs">Mặt Trước 52 Lá (CARD_FACE)</div>
                      <div className="text-[11px] opacity-75 mt-0.5">
                        Trọn bộ 52 lá bài từ 2 đến A cho cả 4 chất
                      </div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeckOptionChange('CARD_BACK')}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                      deckOption === 'CARD_BACK'
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-md'
                        : 'bg-black/30 border-white/10 text-white/60 hover:border-white/20'
                    }`}
                  >
                    <Icon name="flip_to_back" className="text-2xl shrink-0" />
                    <div>
                      <div className="font-bold text-xs">Mặt Lưng Bài (CARD_BACK)</div>
                      <div className="text-[11px] opacity-75 mt-0.5">
                        Texture mặt sau phát sáng neon hoặc họa tiết VIP
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Ingestion Method Tabs: ZIP vs Multi-files */}
              <div>
                <label className="text-xs font-bold text-white/70 block mb-1.5">
                  Phương thức nạp Skin bài vào S3 / MinIO:
                </label>
                <div className="flex items-center gap-2 p-1 bg-black/40 rounded-2xl border border-white/10 mb-3">
                  <button
                    type="button"
                    onClick={() => setIngestionMethod('ZIP')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      ingestionMethod === 'ZIP'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <Icon name="folder_zip" className="text-base" /> Nén File ZIP (Khuyên dùng)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIngestionMethod('FILES')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      ingestionMethod === 'FILES'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <Icon name="collections" className="text-base" /> Chọn Nhiều Ảnh Rời
                  </button>
                  <button
                    type="button"
                    onClick={() => setIngestionMethod('URL')}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                      ingestionMethod === 'URL'
                        ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                        : 'text-white/60 hover:text-white'
                    }`}
                  >
                    <Icon name="link" className="text-base" /> Dùng Template URL
                  </button>
                </div>

                {/* ZIP Upload Box */}
                {ingestionMethod === 'ZIP' && (
                  <div
                    onDragOver={e => e.preventDefault()}
                    onDrop={handleZipDrop}
                    className="border-2 border-dashed border-amber-400/40 hover:border-amber-400 rounded-3xl p-6 text-center bg-black/30 transition-all"
                  >
                    <input
                      type="file"
                      accept=".zip"
                      id="ctrl-panel-zip"
                      onChange={handleZipFileSelect}
                      className="hidden"
                    />
                    <label
                      htmlFor="ctrl-panel-zip"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mb-3 shadow-inner">
                        <Icon name="folder_zip" className="text-3xl" />
                      </div>
                      <span className="text-sm font-bold text-white">
                        {selectedZipFile
                          ? selectedZipFile.name
                          : 'Kéo thả file ZIP vào đây hoặc Bấm để chọn file'}
                      </span>
                      <span className="text-xs text-white/50 mt-1 max-w-md">
                        {selectedZipFile
                          ? `Dung lượng: ${(selectedZipFile.size / 1024).toFixed(1)} KB • Sẵn sàng nạp vào S3`
                          : 'Chứa 52 lá mặt trước (2H.png, AS.png...) và 1 lá mặt sau (back.png). Tự động unpack & tạo texture atlas.'}
                      </span>
                      {selectedZipFile && (
                        <span className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
                          <Icon name="check_circle" className="text-sm" /> File ZIP đã sẵn sàng
                        </span>
                      )}
                    </label>
                  </div>
                )}

                {/* Multiple Files Upload Box */}
                {ingestionMethod === 'FILES' && (
                  <div className="border-2 border-dashed border-white/20 hover:border-amber-400 rounded-3xl p-6 text-center bg-black/30 transition-all">
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      multiple
                      id="ctrl-panel-files"
                      onChange={handleMultiFilesSelect}
                      className="hidden"
                    />
                    <label
                      htmlFor="ctrl-panel-files"
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <Icon name="photo_library" className="text-4xl text-amber-400 mb-2" />
                      <span className="text-sm font-bold text-white">
                        {selectedImageFiles.length > 0
                          ? `Đã chọn ${selectedImageFiles.length} file ảnh lá bài`
                          : 'Chọn danh sách 52 file ảnh lá bài (PNG / WebP)'}
                      </span>
                      <span className="text-xs text-white/50 mt-1">
                        Đặt tên file theo mã chuẩn: 2H.png, 10S.png, AS.png, back.png...
                      </span>
                    </label>
                  </div>
                )}

                {/* Template URL info */}
                {ingestionMethod === 'URL' && (
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-white/70 space-y-1">
                    <p className="font-bold text-amber-400">Template bài tây mẫu:</p>
                    <p>Hệ thống sẽ liên kết asset texture từ CDN mặc định đã tối ưu WebP.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Section 3: Định giá & Kinh tế shop */}
          <div className="p-6 rounded-3xl bg-[#140a24]/95 border border-white/10 shadow-xl space-y-4">
            <h3 className="font-headline font-bold text-base text-white flex items-center gap-2 pb-3 border-b border-white/10">
              <Icon name="payments" className="text-amber-400 text-xl" />
              <span>{productType === 'CARD_SKIN' ? '3.' : '2.'} Thiết Lập Giá Bán & Quyền Sở Hữu</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-amber-400 flex items-center justify-between mb-1.5">
                  <span>Giá VIP Coin (Trong Game):</span>
                  <span className="text-[11px] text-white/40">1 VIP = 1,000 VNĐ</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400 font-bold text-sm">
                    <Icon name="paid" className="text-lg" />
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={priceVipCoin}
                    onChange={e => handlePriceVipCoinChange(e.target.value)}
                    className="w-full pl-10 pr-16 py-2.5 rounded-2xl bg-black/50 border border-white/15 text-sm font-bold text-amber-400 focus:outline-none focus:border-amber-400 transition-colors"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-white/40">
                    VIP COIN
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-white/70 block mb-1.5">
                  Giá niêm yết tương đương (VNĐ):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min={0}
                    step={10000}
                    value={priceVnd}
                    onChange={e => handlePriceVndChange(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-2xl bg-black/50 border border-white/15 text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-white/40">
                    VNĐ
                  </span>
                </div>
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

            {/* Exclusive Checkbox */}
            <div className="flex items-center gap-3 pt-3 border-t border-white/10">
              <input
                type="checkbox"
                id="exclusive-panel-chk"
                checked={isExclusive}
                onChange={e => setIsExclusive(e.target.checked)}
                className="w-4 h-4 rounded border-white/30 text-amber-500 focus:ring-0 focus:ring-offset-0 bg-black/50"
              />
              <label htmlFor="exclusive-panel-chk" className="text-xs text-white/80 cursor-pointer">
                <strong>Vật phẩm độc quyền:</strong> Không cho phép mua tự do bằng VIP Coin, chỉ trao thưởng qua giải đấu Season hoặc sự kiện đặc biệt.
              </label>
            </div>
          </div>

          {/* Section 4: URLs & Assets */}
          <div className="p-6 rounded-3xl bg-[#140a24]/95 border border-white/10 shadow-xl space-y-4">
            <h3 className="font-headline font-bold text-base text-white flex items-center gap-2 pb-3 border-b border-white/10">
              <Icon name="link" className="text-amber-400 text-xl" />
              <span>{productType === 'CARD_SKIN' ? '4.' : '3.'} Đường Dẫn Tài Nguyên (Assets & Review Video)</span>
            </h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-white/70 block mb-1.5">
                  Asset URL (Ảnh preview / mặt lưng / texture sprite):
                </label>
                <input
                  type="text"
                  placeholder="https://assets.msspoker.com/cards/cyber/back.png"
                  value={assetUrl}
                  onChange={e => setAssetUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-black/50 border border-white/15 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400 transition-colors font-mono text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-white/70 block mb-1.5">
                  Video Review MP4/WebM (Tùy chọn - Hiển thị chuyển động bàn chơi/hiệu ứng all-in):
                </label>
                <input
                  type="text"
                  placeholder="https://assets.msspoker.com/videos/allin_dragon.mp4"
                  value={previewVideoUrl}
                  onChange={e => setPreviewVideoUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-black/50 border border-white/15 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400 transition-colors font-mono text-xs"
                />
              </div>
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
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                Live Preview
              </span>
            </div>

            {/* Live Cosmetic Visualizer */}
            <div className="w-full aspect-[16/11] rounded-2xl bg-radial from-[#1e0e3a] to-[#0a0314] border border-white/10 flex items-center justify-center relative overflow-hidden p-4">
              <CosmeticRenderer
                categoryCode={selectedCategoryObj?.code || 'CARD_FACE'}
                previewUrl={assetUrl}
                assetUrl={assetUrl}
                productName={name || 'Tên vật phẩm'}
                rank="A"
                suit="S"
              />

              <span className="absolute bottom-3 left-3 px-2 py-1 rounded-md bg-black/80 backdrop-blur-md text-[11px] font-bold text-white/90">
                {selectedCategoryObj?.name || 'Vật phẩm'}
              </span>

              {productType === 'CARD_SKIN' && (
                <span className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-amber-400/90 text-slate-950 font-black text-[10px] shadow-md flex items-center gap-1">
                  <Icon name="visibility" className="text-xs" /> 52 Lá
                </span>
              )}
            </div>

            {/* Product Metadata Summary */}
            <div className="space-y-3 pt-2 text-xs">
              <div>
                <span className="text-white/40 block">Tên sản phẩm:</span>
                <span className="font-headline font-bold text-white text-base block mt-0.5">
                  {name || 'Chưa đặt tên'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10">
                <div>
                  <span className="text-white/40 block">Phân hạng Tier:</span>
                  <span className="font-bold text-amber-300 block mt-0.5">
                    {tier}
                  </span>
                </div>
                <div>
                  <span className="text-white/40 block">Mở bán:</span>
                  <span className="font-bold text-white block mt-0.5">
                    {isExclusive ? 'Độc quyền' : 'Công khai'}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-white/40 block">Giá VIP Coin:</span>
                  <span className="font-headline font-black text-amber-400 text-lg">
                    {formatVipCoin(priceVipCoin)} VIP
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-white/40 block">Quy đổi VNĐ:</span>
                  <span className="text-white/70 font-bold">
                    {formatVnd(priceVnd)}
                  </span>
                </div>
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
    </div>
  )
}
