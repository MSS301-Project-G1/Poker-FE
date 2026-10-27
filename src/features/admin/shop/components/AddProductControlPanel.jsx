import { useState, useMemo, useRef, useEffect } from 'react'
import { Icon, Button, useToast } from '@/shared/ui'
import { formatVipCoin, formatVnd } from '../utils/adminFormatters'
import CosmeticRenderer from '@/features/shop/components/CosmeticRenderer'
import AddCategoryModal from './AddCategoryModal'
import ImageCropperModal from './ImageCropperModal'
import { uploadProductSound, uploadAssetFile } from '../services/adminShopService'

const DEALER_POSES_SCHEMA = [
  {
    key: 'idle',
    label: '1. Đứng Chờ (Idle)',
    shortName: 'Đứng Chờ',
    desc: 'Tư thế đứng chuẩn khi người chơi đang suy nghĩ hoặc đặt cược.',
    icon: 'accessibility_new',
    badge: 'Mặc định',
  },
  {
    key: 'deal',
    label: '2. Chia Bài (Deal)',
    shortName: 'Chia Bài',
    desc: 'Tư thế đưa tay chia bài ra bàn chơi cho người chơi.',
    icon: 'style',
    badge: 'Hành động',
  },
  {
    key: 'flip',
    label: '3. Lật Bài (Flip)',
    shortName: 'Lật Bài',
    desc: 'Tư thế lật bài Flop, Turn, River hoặc bài tẩy showdown.',
    icon: 'flip',
    badge: 'Hành động',
  },
  {
    key: 'win',
    label: '4. Ăn Mừng (Win)',
    shortName: 'Ăn Mừng',
    desc: 'Tư thế vỗ tay, chúc mừng hoặc tươi cười khi có người ăn pot.',
    icon: 'celebration',
    badge: 'Hiệu ứng',
  },
  {
    key: 'avatar',
    label: '5. Avatar Tròn (Table)',
    shortName: 'Avatar Tròn',
    desc: 'Ảnh đại diện Dealer hiển thị ở góc bàn chơi và trong Shop.',
    icon: 'account_circle',
    badge: 'Nhận diện',
  },
]

export const CATEGORY_ASSET_RULES = {
  CARD_SKIN: {
    name: 'Skin Bộ Bài',
    required: ['hasDeckZip'],
    allowed: ['hasDeckZip', 'hasVideo'],
    disallowedReasons: {
      hasImage: 'Skin bài tây nạp trọn bộ qua tệp ZIP 52 lá thay cho 1 ảnh lẻ',
      hasSound: 'Skin bài tây không gắn tệp âm thanh MP3 riêng',
      hasPoses: 'Chỉ Người chia bài (Dealer) mới có 5 tư thế hành động',
    },
    default: { hasImage: false, hasVideo: false, hasSound: false, hasPoses: false, hasDeckZip: true },
    guide: 'Skin Bộ Bài yêu cầu nạp tệp ZIP đủ 52/53 lá bài (chuẩn mặt lưng + 52 quân) và tùy chọn video review.',
  },
  DEALER: {
    name: 'Người Chia Bài',
    required: ['hasPoses'],
    allowed: ['hasPoses', 'hasVideo'],
    disallowedReasons: {
      hasImage: 'Dealer dùng bộ 5 tư thế chuyên dụng thay cho ảnh đơn',
      hasSound: 'Dealer không dùng tệp âm thanh độc lập',
      hasDeckZip: 'Dealer không phải là bộ bài tây',
    },
    default: { hasImage: false, hasVideo: false, hasSound: false, hasPoses: true, hasDeckZip: false },
    guide: 'Người chia bài yêu cầu tải lên 5 tư thế: Đứng chờ, Chia bài, Lật bài, Ăn mừng và Avatar góc bàn.',
  },
  COIN_SKIN: {
    name: 'Skin Đồng Xu (Chip)',
    required: ['hasImage'],
    allowed: ['hasImage', 'hasVideo'],
    disallowedReasons: {
      hasSound: 'Đồng xu chip cược không gắn tệp âm thanh MP3 (chỉ dùng cho danh mục Âm thanh)',
      hasPoses: 'Đồng xu chip cược không có tư thế Dealer',
      hasDeckZip: 'Đồng xu chip cược không dùng tệp nén bài tây ZIP',
    },
    default: { hasImage: true, hasVideo: false, hasSound: false, hasPoses: false, hasDeckZip: false },
    guide: 'Skin Đồng Xu (Chip Poker) yêu cầu 1 ảnh texture mặt chip (PNG/WebP tròn) và tùy chọn video review 3D.',
  },
  TABLE: {
    name: 'Bàn Chơi',
    required: ['hasImage'],
    allowed: ['hasImage', 'hasVideo'],
    disallowedReasons: {
      hasSound: 'Bàn chơi không gắn tệp âm thanh MP3 riêng',
      hasPoses: 'Bàn chơi không có tư thế Dealer',
      hasDeckZip: 'Bàn chơi không dùng tệp bài tây ZIP',
    },
    default: { hasImage: true, hasVideo: false, hasSound: false, hasPoses: false, hasDeckZip: false },
    guide: 'Bàn chơi yêu cầu ảnh nỉ bàn cược poker tỷ lệ chuẩn và tùy chọn video review ánh sáng bàn.',
  },
  FRAME: {
    name: 'Khung Avatar',
    required: ['hasImage'],
    allowed: ['hasImage', 'hasVideo'],
    disallowedReasons: {
      hasSound: 'Khung avatar không gắn tệp âm thanh MP3',
      hasPoses: 'Khung avatar không có tư thế Dealer',
      hasDeckZip: 'Khung avatar không dùng tệp bài tây ZIP',
    },
    default: { hasImage: true, hasVideo: false, hasSound: false, hasPoses: false, hasDeckZip: false },
    guide: 'Khung Avatar yêu cầu ảnh viền tròn PNG trong suốt (hỗ trợ công cụ Cắt & Căn Tròn) và tùy chọn video hiệu ứng.',
  },
  SOUND: {
    name: 'Âm Thanh',
    required: ['hasSound', 'hasImage'],
    allowed: ['hasSound', 'hasImage'],
    disallowedReasons: {
      hasVideo: 'Gói âm thanh không sử dụng video review',
      hasPoses: 'Gói âm thanh không có tư thế Dealer',
      hasDeckZip: 'Gói âm thanh không dùng tệp bài tây ZIP',
    },
    default: { hasImage: true, hasVideo: false, hasSound: true, hasPoses: false, hasDeckZip: false },
    guide: 'Âm Thanh yêu cầu tải lên tệp âm thanh MP3/WAV (< 2MB) và 1 ảnh icon đại diện hiển thị trong Shop.',
  },
  ALL_IN_EFFECT: {
    name: 'Hiệu Ứng All-in',
    required: ['hasImage'],
    allowed: ['hasImage', 'hasVideo'],
    disallowedReasons: {
      hasSound: 'Hiệu ứng All-in được tích hợp đồng bộ qua video / shader particle',
      hasPoses: 'Chỉ Dealer mới có tư thế động',
      hasDeckZip: 'Hiệu ứng All-in không dùng tệp bài tây ZIP',
    },
    default: { hasImage: true, hasVideo: true, hasSound: false, hasPoses: false, hasDeckZip: false },
    guide: 'Hiệu ứng All-in yêu cầu ảnh texture / icon và khuyến khích đính kèm video review (MP4/WebM) mô phỏng hiệu ứng bàn.',
  },
  VICTORY_EFFECT: {
    name: 'Hiệu Ứng Chiến Thắng',
    required: ['hasImage'],
    allowed: ['hasImage', 'hasVideo'],
    disallowedReasons: {
      hasSound: 'Hiệu ứng chiến thắng được tích hợp đồng bộ qua video / shader particle',
      hasPoses: 'Chỉ Dealer mới có tư thế động',
      hasDeckZip: 'Hiệu ứng chiến thắng không dùng tệp bài tây ZIP',
    },
    default: { hasImage: true, hasVideo: true, hasSound: false, hasPoses: false, hasDeckZip: false },
    guide: 'Hiệu ứng Chiến Thắng yêu cầu ảnh texture / icon và khuyến khích đính kèm video review mô phỏng pháo hoa / mưa tiền.',
  },
  EMOJI: {
    name: 'Biểu Cảm (Emoji)',
    required: ['hasImage'],
    allowed: ['hasImage', 'hasVideo'],
    disallowedReasons: {
      hasSound: 'Biểu cảm emoji không gắn tệp âm thanh',
      hasPoses: 'Biểu cảm emoji không có tư thế Dealer',
      hasDeckZip: 'Biểu cảm emoji không dùng tệp bài tây ZIP',
    },
    default: { hasImage: true, hasVideo: false, hasSound: false, hasPoses: false, hasDeckZip: false },
    guide: 'Biểu cảm yêu cầu ảnh PNG/WebP trong suốt và tùy chọn video ngắn lặp lại (looping animation).',
  },
}

export const DEFAULT_FALLBACK_RULE = {
  name: 'Vật Phẩm Khác',
  required: ['hasImage'],
  allowed: ['hasImage', 'hasVideo'],
  disallowedReasons: {
    hasSound: 'Danh mục này không dùng âm thanh MP3',
    hasPoses: 'Danh mục này không có tư thế Dealer',
    hasDeckZip: 'Danh mục này không dùng tệp bài tây ZIP',
  },
  default: { hasImage: true, hasVideo: false, hasSound: false, hasPoses: false, hasDeckZip: false },
  guide: 'Vui lòng tải lên ảnh texture hoặc icon đại diện cho vật phẩm.',
}

export const getCategoryRule = (code) => {
  const normalized = String(code || '').toUpperCase()
  return CATEGORY_ASSET_RULES[normalized] || DEFAULT_FALLBACK_RULE
}

export default function AddProductControlPanel({
  categories = [],
  onRefreshCategories,
  createProduct,
  updateProduct,
  editingProduct = null,
  uploadDeckSkinZip,
  uploadDeckSkinFiles,
  onSuccess,
  onCancel,
}) {
  const notify = useToast()
  const isEditing = Boolean(editingProduct?.id)

  // Modal Category & Cropper
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false)
  const [showCropperModal, setShowCropperModal] = useState(false)
  const [cropperSource, setCropperSource] = useState(null)
  const [cropTargetPoseKey, setCropTargetPoseKey] = useState(null)
  const [cropShape, setCropShape] = useState('square')

  // Selected Category
  const [selectedCategoryId, setSelectedCategoryId] = useState(
    editingProduct?.categoryId || categories[0]?.id || ''
  )

  useEffect(() => {
    if (!selectedCategoryId && categories.length > 0) {
      setSelectedCategoryId(categories[0].id)
    }
  }, [categories, selectedCategoryId])

  const currentCategory = useMemo(() => {
    return (
      categories.find(c => c.id === selectedCategoryId) ||
      categories.find(c => c.code === editingProduct?.categoryCode) ||
      categories[0]
    )
  }, [categories, selectedCategoryId, editingProduct])

  const catCode = useMemo(() => {
    return String(currentCategory?.code || editingProduct?.categoryCode || '').toUpperCase()
  }, [currentCategory, editingProduct])

  const categoryRule = useMemo(() => getCategoryRule(catCode), [catCode])

  // Asset Requirements Configuration (Enforced per category & product)
  const [assetConfig, setAssetConfig] = useState(() => {
    const rule = getCategoryRule(catCode)
    const initial = { ...rule.default }

    if (editingProduct?.metadata) {
      try {
        const meta =
          typeof editingProduct.metadata === 'string'
            ? JSON.parse(editingProduct.metadata)
            : editingProduct.metadata
        if (meta?.assetConfig) {
          // Only accept keys that are allowed for this category
          rule.allowed.forEach(k => {
            if (meta.assetConfig[k] !== undefined) {
              initial[k] = Boolean(meta.assetConfig[k])
            }
          })
          // Force required keys to true
          rule.required.forEach(k => {
            initial[k] = true
          })
        }
      } catch (err) {
        console.error('Error parsing assetConfig from metadata:', err)
      }
    }
    return initial
  })

  // When category changes, auto-select and enforce the new category's asset configuration
  const prevCatCodeRef = useRef(catCode)
  useEffect(() => {
    if (prevCatCodeRef.current !== catCode) {
      prevCatCodeRef.current = catCode
      setAssetConfig({ ...categoryRule.default })
    }
  }, [catCode, categoryRule])

  // Smart Handler for toggling asset configuration with warnings
  const handleToggleAssetConfig = (key, itemLabel) => {
    const isAllowed = categoryRule.allowed.includes(key)
    const isRequired = categoryRule.required.includes(key)

    // 1. Incompatible / Disallowed: Show clear warning and block
    if (!isAllowed) {
      const reason = categoryRule.disallowedReasons?.[key] || `Danh mục ${currentCategory?.name || catCode} không hỗ trợ loại tệp này`
      notify(`⚠️ Không thể chọn! ${reason}.`, { type: 'warning' })
      return
    }

    // 2. Required asset: cannot turn off
    if (isRequired && assetConfig[key]) {
      notify(`ℹ️ Mục "${itemLabel}" là tệp bắt buộc cho danh mục ${currentCategory?.name || catCode}, không thể tắt!`, {
        type: 'info',
      })
      return
    }

    // 3. Optional asset: toggle freely
    setAssetConfig(prev => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  // Form Fields
  const [name, setName] = useState(editingProduct?.name || '')
  const [description, setDescription] = useState(editingProduct?.description || '')
  const [tier, setTier] = useState(editingProduct?.tier || 'VIP')
  const [priceVnd, setPriceVnd] = useState(editingProduct?.priceVnd ?? 50000)
  const [priceVipCoin, setPriceVipCoin] = useState(
    editingProduct?.priceVipCoin ?? Math.round((editingProduct?.priceVnd || 50000) / 1000)
  )
  const [isExclusive, setIsExclusive] = useState(Boolean(editingProduct?.isExclusive))
  const [isFlashSale, setIsFlashSale] = useState(Boolean(editingProduct?.saleExpiresAt))
  const [flashSalePreset, setFlashSalePreset] = useState(
    editingProduct?.saleExpiresAt ? 'CUSTOM' : '2_DAYS'
  )
  const [customSaleExpiresAt, setCustomSaleExpiresAt] = useState(() => {
    if (editingProduct?.saleExpiresAt) {
      try {
        const dt = new Date(editingProduct.saleExpiresAt)
        const pad = n => String(n).padStart(2, '0')
        return `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`
      } catch {
        return ''
      }
    }
    return ''
  })

  // Dealer Multi-Pose Upload Map (idle, deal, flip, win, avatar)
  const [dealerPoses, setDealerPoses] = useState(() => {
    const initial = {
      idle: { file: null, previewUrl: '' },
      deal: { file: null, previewUrl: '' },
      flip: { file: null, previewUrl: '' },
      win: { file: null, previewUrl: '' },
      avatar: { file: null, previewUrl: '' },
    }
    if (editingProduct?.metadata) {
      try {
        const meta =
          typeof editingProduct.metadata === 'string'
            ? JSON.parse(editingProduct.metadata)
            : editingProduct.metadata
        if (meta?.poses) {
          initial.idle.previewUrl = meta.poses.idle || ''
          initial.deal.previewUrl = meta.poses.deal || ''
          initial.flip.previewUrl = meta.poses.flip || ''
          initial.win.previewUrl = meta.poses.win || ''
          initial.avatar.previewUrl = meta.poses.avatar || editingProduct.assetUrl || ''
        }
      } catch (err) {
        console.error('Error parsing product metadata:', err)
      }
    }
    if (!initial.avatar.previewUrl && editingProduct?.assetUrl) {
      initial.avatar.previewUrl = editingProduct.assetUrl
    }
    return initial
  })

  // Active Live Preview tab for Dealer
  const [activeDealerPreviewPose, setActiveDealerPreviewPose] = useState('idle')
  const [isAutoAnimatingDealer, setIsAutoAnimatingDealer] = useState(false)

  // Local Files & Previews (Generic fallback)
  const [localAssetFile, setLocalAssetFile] = useState(null)
  const [localAssetPreviewUrl, setLocalAssetPreviewUrl] = useState(editingProduct?.assetUrl || '')
  const [localVideoFile, setLocalVideoFile] = useState(null)
  const [localVideoPreviewUrl, setLocalVideoPreviewUrl] = useState(editingProduct?.previewVideoUrl || '')
  const [localSoundFile, setLocalSoundFile] = useState(null)
  const [localSoundPreviewUrl, setLocalSoundPreviewUrl] = useState('')

  // Card Skin specific files
  const [deckMethod, setDeckMethod] = useState('ZIP') // 'ZIP' | 'FILES'
  const [selectedZipFile, setSelectedZipFile] = useState(null)
  const [selectedImageFiles, setSelectedImageFiles] = useState([])

  // Fallback URLs
  const [manualAssetUrl, setManualAssetUrl] = useState(editingProduct?.assetUrl || '')
  const [manualVideoUrl, setManualVideoUrl] = useState(editingProduct?.previewVideoUrl || '')

  // Sound player
  const [isPlayingAudio, setIsPlayingAudio] = useState(false)
  const audioRef = useRef(null)

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStep, setSubmitStep] = useState('')

  // Sync state if editingProduct changes
  useEffect(() => {
    if (editingProduct) {
      setName(editingProduct.name || '')
      setDescription(editingProduct.description || '')
      setTier(editingProduct.tier || 'VIP')
      setPriceVnd(editingProduct.priceVnd ?? 50000)
      setPriceVipCoin(
        editingProduct.priceVipCoin ?? Math.round((editingProduct.priceVnd || 50000) / 1000)
      )
      setIsExclusive(Boolean(editingProduct.isExclusive))
      setManualAssetUrl(editingProduct.assetUrl || '')
      setManualVideoUrl(editingProduct.previewVideoUrl || '')
      setLocalAssetPreviewUrl(editingProduct.assetUrl || '')
      setLocalVideoPreviewUrl(editingProduct.previewVideoUrl || '')

      const matchedCat = categories.find(
        c => c.id === editingProduct.categoryId || c.code === editingProduct.categoryCode
      )
      if (matchedCat) {
        setSelectedCategoryId(matchedCat.id)
      }

      if (editingProduct.saleExpiresAt) {
        setIsFlashSale(true)
        setFlashSalePreset('CUSTOM')
        try {
          const dt = new Date(editingProduct.saleExpiresAt)
          const pad = n => String(n).padStart(2, '0')
          setCustomSaleExpiresAt(
            `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}T${pad(dt.getHours())}:${pad(dt.getMinutes())}`
          )
        } catch {
          setCustomSaleExpiresAt('')
        }
      } else {
        setIsFlashSale(false)
      }

      if (editingProduct.metadata) {
        try {
          const meta =
            typeof editingProduct.metadata === 'string'
              ? JSON.parse(editingProduct.metadata)
              : editingProduct.metadata
          if (meta?.poses) {
            setDealerPoses({
              idle: { file: null, previewUrl: meta.poses.idle || '' },
              deal: { file: null, previewUrl: meta.poses.deal || '' },
              flip: { file: null, previewUrl: meta.poses.flip || '' },
              win: { file: null, previewUrl: meta.poses.win || '' },
              avatar: { file: null, previewUrl: meta.poses.avatar || editingProduct.assetUrl || '' },
            })
          }
        } catch (e) {
          console.error('Error parsing product metadata on change:', e)
        }
      }
    }
  }, [editingProduct, categories])

  // Dealer Auto Animation Timer
  useEffect(() => {
    if (!isAutoAnimatingDealer || catCode !== 'DEALER') return
    const order = ['idle', 'deal', 'flip', 'win']
    const interval = setInterval(() => {
      setActiveDealerPreviewPose(current => {
        const idx = order.indexOf(current)
        const nextIdx = (idx + 1) % order.length
        return order[nextIdx]
      })
    }, 1500)
    return () => clearInterval(interval)
  }, [isAutoAnimatingDealer, catCode])

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
    const ms = msMap[flashSalePreset] || 2 * 24 * 60 * 60 * 1000
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

  // Dealer Slot File Handlers
  const handleDealerPoseFileSelect = (poseKey, file) => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setDealerPoses(prev => ({
      ...prev,
      [poseKey]: { file, previewUrl: url },
    }))
    setActiveDealerPreviewPose(poseKey)
  }

  // Quick Multi-file batch upload for Dealer (select 4-5 files at once)
  const handleDealerBatchFilesSelect = e => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const order = ['idle', 'deal', 'flip', 'win', 'avatar']
    setDealerPoses(prev => {
      const updated = { ...prev }
      files.forEach((file, index) => {
        if (index < order.length) {
          const key = order[index]
          updated[key] = {
            file,
            previewUrl: URL.createObjectURL(file),
          }
        }
      })
      // If 4 files provided, default avatar to pose 1 (idle)
      if (files.length === 4 && updated.idle?.previewUrl && !updated.avatar?.previewUrl) {
        updated.avatar = {
          file: updated.idle.file,
          previewUrl: updated.idle.previewUrl,
        }
      }
      return updated
    })

    notify(`Đã nạp ${Math.min(files.length, 5)} ảnh vào các tư thế Dealer!`, { type: 'success' })
  }

  const handleOpenPoseCropper = poseKey => {
    const poseItem = dealerPoses[poseKey]
    if (!poseItem?.previewUrl) return
    setCropTargetPoseKey(poseKey)
    setCropperSource(poseItem.previewUrl)
    setCropShape(poseKey === 'avatar' ? 'circle' : 'square')
    setShowCropperModal(true)
  }

  const handleClearPose = poseKey => {
    setDealerPoses(prev => ({
      ...prev,
      [poseKey]: { file: null, previewUrl: '' },
    }))
  }

  // Generic File Handlers
  const handleAssetFileSelect = e => {
    const file = e.target.files?.[0]
    if (!file) return
    setLocalAssetFile(file)
    const url = URL.createObjectURL(file)
    setLocalAssetPreviewUrl(url)

    if (catCode === 'FRAME') {
      setCropTargetPoseKey('generic')
      setCropperSource(url)
      setCropShape('circle')
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
    if (cropTargetPoseKey && cropTargetPoseKey !== 'generic') {
      setDealerPoses(prev => ({
        ...prev,
        [cropTargetPoseKey]: { file: croppedFile, previewUrl: dataUrl },
      }))
      notify(`Đã cắt ảnh tư thế "${cropTargetPoseKey}" thành công!`, { type: 'success' })
    } else {
      setLocalAssetFile(croppedFile)
      setLocalAssetPreviewUrl(dataUrl)
      notify('Đã cắt và căn khung ảnh thành công!', { type: 'success' })
    }
    setShowCropperModal(false)
  }

  // Submit Handler (Create or Update)
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

      const metaObj = {}
      if (editingProduct?.metadata) {
        try {
          const parsed =
            typeof editingProduct.metadata === 'string'
              ? JSON.parse(editingProduct.metadata)
              : editingProduct.metadata
          Object.assign(metaObj, parsed)
        } catch {
          // ignore
        }
      }
      metaObj.assetConfig = assetConfig
      metaObj.updatedAt = new Date().toISOString()

      // 1. DEALER / Multi-Pose Upload Logic if active
      if (assetConfig.hasPoses) {
        setSubmitStep('Đang đồng bộ các tư thế Dealer lên S3...')
        const uploadedPoses = metaObj.poses || {}

        for (const pose of DEALER_POSES_SCHEMA) {
          const key = pose.key
          const poseItem = dealerPoses[key]
          if (poseItem?.file) {
            setSubmitStep(`Đang tải ảnh tư thế: ${pose.shortName}...`)
            const res = await uploadAssetFile(poseItem.file, 'dealers/poses')
            if (res?.data?.url) {
              uploadedPoses[key] = res.data.url
            }
          } else if (poseItem?.previewUrl) {
            uploadedPoses[key] = poseItem.previewUrl
          }
        }

        metaObj.poses = uploadedPoses

        if (uploadedPoses.avatar) {
          finalAssetUrl = uploadedPoses.avatar
        } else if (uploadedPoses.idle) {
          finalAssetUrl = uploadedPoses.idle
        }
      }

      // 2. Generic / Texture image upload if active
      if (assetConfig.hasImage && localAssetFile) {
        setSubmitStep('Đang tải tệp hình ảnh / texture lên S3...')
        const res = await uploadAssetFile(localAssetFile, 'assets')
        if (res?.data?.url) {
          finalAssetUrl = res.data.url
        }
      }

      // 3. Video review upload if active
      if (assetConfig.hasVideo && localVideoFile) {
        setSubmitStep('Đang tải video review lên S3...')
        const res = await uploadAssetFile(localVideoFile, 'videos')
        if (res?.data?.url) {
          finalVideoUrl = res.data.url
        }
      }

      // Fallbacks
      if (!finalAssetUrl) {
        if (catCode === 'CARD_SKIN') {
          finalAssetUrl = 'https://assets.msspoker.com/cards/gold_black/back.png'
        } else if (catCode === 'TABLE') {
          finalAssetUrl = 'https://assets.msspoker.com/tables/classic_green.png'
        } else if (catCode === 'DEALER') {
          finalAssetUrl = 'https://assets.msspoker.com/dealers/default_avatar.png'
        } else {
          finalAssetUrl = 'https://assets.msspoker.com/placeholders/cosmetic.png'
        }
      }

      // Payload
      const productPayload = {
        categoryId: selectedCategoryId,
        name: name.trim(),
        description: description.trim(),
        tier,
        priceVnd,
        priceVipCoin,
        assetUrl: finalAssetUrl,
        previewVideoUrl: assetConfig.hasVideo ? (finalVideoUrl || null) : null,
        isExclusive,
        saleExpiresAt: computedSaleExpiresAt,
        metadata: JSON.stringify(metaObj),
      }

      let productId = editingProduct?.id

      if (isEditing) {
        setSubmitStep('Đang cập nhật sản phẩm...')
        if (!updateProduct) {
          throw new Error('Chức năng cập nhật sản phẩm chưa được cấu hình')
        }
        await updateProduct(editingProduct.id, productPayload)
        notify(`Cập nhật sản phẩm "${name}" thành công!`, { type: 'success' })
      } else {
        setSubmitStep('Đang tạo bản ghi sản phẩm mới...')
        const created = await createProduct(productPayload)
        productId = created?.data?.id || created?.result?.id || created?.id
        if (!productId) {
          throw new Error('Không nhận được ID sản phẩm sau khi tạo')
        }
        notify(`Tạo sản phẩm "${name}" thành công!`, { type: 'success' })
      }

      // Sound upload if provided and active
      if (assetConfig.hasSound && localSoundFile && productId) {
        setSubmitStep('Đang liên kết tệp âm thanh...')
        await uploadProductSound(productId, localSoundFile)
      }

      // Card Skin Ingestion if active and new files selected
      if (assetConfig.hasDeckZip && productId) {
        if (selectedZipFile) {
          setSubmitStep('Đang giải nén và nạp bộ bài 52 lá...')
          await uploadDeckSkinZip(productId, selectedZipFile)
        } else if (selectedImageFiles.length > 0) {
          setSubmitStep('Đang nạp các lá bài rời...')
          await uploadDeckSkinFiles(productId, selectedImageFiles)
        }
      }

      onSuccess?.()
    } catch (err) {
      notify(err.message || (isEditing ? 'Lỗi khi cập nhật sản phẩm' : 'Lỗi khi tạo sản phẩm'), {
        type: 'error',
      })
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

  // Current active dealer preview image
  const currentDealerPreviewUrl = useMemo(() => {
    return (
      dealerPoses[activeDealerPreviewPose]?.previewUrl ||
      dealerPoses.avatar?.previewUrl ||
      dealerPoses.idle?.previewUrl ||
      localAssetPreviewUrl ||
      manualAssetUrl
    )
  }, [dealerPoses, activeDealerPreviewPose, localAssetPreviewUrl, manualAssetUrl])

  return (
    <div className="space-y-6 animate-fade-in text-white">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                isEditing
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
              }`}
            >
              {isEditing ? 'Chế Độ Chỉnh Sửa' : 'Thêm Mới'}
            </span>
            <h2 className="font-headline font-black text-xl text-white flex items-center gap-2">
              <Icon
                name={isEditing ? 'edit_note' : 'add_circle'}
                className={isEditing ? 'text-cyan-400 text-2xl' : 'text-amber-400 text-2xl'}
              />
              <span>
                {isEditing ? `Chỉnh Sửa Vật Phẩm: ${editingProduct.name}` : 'Thêm Mới Vật Phẩm & Skin Vào Shop'}
              </span>
            </h2>
          </div>
          <p className="text-xs text-white/50 mt-1">
            {isEditing
              ? 'Cập nhật phân hạng, giá bán và cấu hình tệp tài nguyên của sản phẩm'
              : 'Tùy biến cấu hình tệp tài nguyên linh hoạt theo từng danh mục vật phẩm'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Hủy Bỏ
          </Button>
          <Button
            variant={isEditing ? 'primary' : 'gold'}
            size="sm"
            icon={isEditing ? 'save' : 'publish'}
            loading={isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting
              ? submitStep || 'Đang Xử Lý...'
              : isEditing
                ? 'Lưu Thay Đổi'
                : 'Lưu Sản Phẩm Ngay'}
          </Button>
        </div>
      </div>

      {/* Main Layout (8 cols form + 4 cols sticky preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Dynamic Form Fields */}
        <div className="lg:col-span-8 space-y-6">
          {/* Step 1: Danh Mục & Nhận Diện */}
          <div className="p-6 rounded-3xl bg-[#140a24]/95 border border-white/10 shadow-xl space-y-4">
            <h3 className="font-headline font-bold text-base text-white flex items-center gap-2 pb-3 border-b border-white/10">
              <Icon name="category" className="text-amber-400 text-xl" />
              <span>1. Chọn Danh Mục & Thông Tin Nhận Diện</span>
            </h3>

            {/* Row 1: Category Selector & Product Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="min-h-[26px] flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-white/80">
                    Danh mục hiển thị: <span className="text-amber-400">*</span>
                  </label>
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => setShowAddCategoryModal(true)}
                      className="text-[11px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors px-2 py-0.5 rounded-lg bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30"
                    >
                      <Icon name="add" className="text-sm" />
                      <span>+ Thêm danh mục mới</span>
                    </button>
                  )}
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
                <div className="min-h-[26px] flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-white/80">
                    Tên sản phẩm mở bán: <span className="text-rose-400">*</span>
                  </label>
                  <span className="text-[11px] text-white/40">Bắt buộc</span>
                </div>
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

          {/* Step 2: Dynamic Asset Upload Area */}
          <div className="p-6 rounded-3xl bg-[#140a24]/95 border border-white/10 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 flex-wrap gap-2">
              <h3 className="font-headline font-bold text-base text-white flex items-center gap-2">
                <Icon name="upload_file" className="text-amber-400 text-xl" />
                <span>2. Tải Lên Tệp Tài Nguyên Cho:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/40 text-xs font-black">
                  {currentCategory?.name || 'Vật Phẩm'} ({catCode})
                </span>
              </h3>
              <span className="text-[11px] text-white/50">
                Chọn trực tiếp từ máy tính • Tự động xử lý & tải lên S3
              </span>
            </div>

            {/* Asset Requirement Configuration Bar */}
            <div className="p-4 rounded-2xl bg-black/40 border border-amber-400/20 space-y-3">
              {/* Smart Category Guidance Banner */}
              <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-400/10 border border-amber-400/25">
                <Icon name="auto_awesome" className="text-amber-400 text-lg mt-0.5 shrink-0" />
                <div className="text-xs space-y-0.5">
                  <div className="font-bold text-amber-300 flex items-center gap-2 flex-wrap">
                    <span>Tự động tối ưu định dạng tệp cho: <strong>{currentCategory?.name || catCode}</strong></span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono border border-amber-400/30">
                      {catCode}
                    </span>
                  </div>
                  <p className="text-white/70 text-[11px] leading-relaxed">
                    {categoryRule.guide}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                <span className="text-xs font-bold text-white/80 flex items-center gap-1.5">
                  <Icon name="tune" className="text-amber-400 text-sm" />
                  <span>Cấu hình loại tệp nhận diện:</span>
                </span>
                <span className="text-[11px] text-white/40">
                  (Hệ thống tự động khóa loại tệp không tương thích để tránh admin bấm nhầm)
                </span>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {[
                  { key: 'hasImage', label: 'Ảnh Texture / Icon', icon: 'image' },
                  { key: 'hasVideo', label: 'Video Review (MP4)', icon: 'videocam' },
                  { key: 'hasSound', label: 'Âm Thanh (MP3)', icon: 'volume_up' },
                  { key: 'hasPoses', label: 'Đa Tư Thế Động (Poses)', icon: 'accessibility_new' },
                  { key: 'hasDeckZip', label: 'Bộ Bài 52 Lá (ZIP)', icon: 'style' },
                ].map(item => {
                  const isAllowed = categoryRule.allowed.includes(item.key)
                  const isRequired = categoryRule.required.includes(item.key)
                  const active = Boolean(assetConfig[item.key])
                  const disallowedReason = categoryRule.disallowedReasons?.[item.key]

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleToggleAssetConfig(item.key, item.label)}
                      title={
                        !isAllowed
                          ? `⚠️ Không hỗ trợ: ${disallowedReason}`
                          : isRequired
                            ? `Bắt buộc cho danh mục ${currentCategory?.name || catCode}`
                            : active
                              ? 'Bấm để tắt tệp tùy chọn này'
                              : 'Bấm để bật tệp tùy chọn này'
                      }
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border ${
                        !isAllowed
                          ? 'opacity-35 bg-white/[0.02] text-white/30 border-white/5 cursor-not-allowed hover:border-rose-500/40 hover:text-rose-300 hover:opacity-70'
                          : isRequired
                            ? 'bg-amber-400/20 text-amber-300 border-amber-400/80 shadow-sm shadow-amber-400/10 cursor-default'
                            : active
                              ? 'bg-cyan-500/20 text-cyan-300 border-cyan-400 shadow-sm shadow-cyan-400/10'
                              : 'bg-white/5 text-white/50 border-white/10 hover:border-white/20 hover:text-white/80'
                      }`}
                    >
                      <Icon
                        name={!isAllowed ? 'block' : item.icon}
                        className={`text-sm ${
                          !isAllowed
                            ? 'text-white/30'
                            : isRequired
                              ? 'text-amber-400'
                              : active
                                ? 'text-cyan-400'
                                : 'text-white/40'
                        }`}
                      />
                      <span>{item.label}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded font-black tracking-wider uppercase ${
                          !isAllowed
                            ? 'bg-white/5 text-white/30 border border-white/10'
                            : isRequired
                              ? 'bg-amber-400 text-slate-950 font-black'
                              : active
                                ? 'bg-cyan-400 text-slate-950'
                                : 'bg-white/10 text-white/40'
                        }`}
                      >
                        {!isAllowed ? 'KHÔNG HỖ TRỢ' : isRequired ? 'BẮT BUỘC' : active ? 'BẬT' : 'TẮT'}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Case A: Poses Management (DEALER / Multi-Pose) */}
            {assetConfig.hasPoses && (
              <div className="space-y-4">
                {/* Batch upload bar */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-transparent border border-amber-400/30 flex items-center justify-between flex-wrap gap-3">
                  <div className="space-y-0.5">
                    <span className="text-xs font-black text-amber-300 flex items-center gap-1.5">
                      <Icon name="bolt" className="text-amber-400 text-sm" />
                      Tải Nhanh Cả 4 - 5 Ảnh Cùng Lúc (Multi-Upload)
                    </span>
                    <p className="text-[11px] text-white/60">
                      Chọn 4 hoặc 5 ảnh từ máy tính. Hệ thống sẽ tự động gán theo thứ tự: 1. Đứng chờ ➔ 2. Chia bài ➔ 3. Lật bài ➔ 4. Ăn mừng ➔ 5. Avatar.
                    </p>
                  </div>
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      id="dealer-batch-upload"
                      onChange={handleDealerBatchFilesSelect}
                      className="hidden"
                    />
                    <label
                      htmlFor="dealer-batch-upload"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black shadow-lg cursor-pointer transition-transform active:scale-95"
                    >
                      <Icon name="drive_folder_upload" className="text-base" />
                      <span>⚡ Chọn 4-5 Tệp Ảnh Rời</span>
                    </label>
                  </div>
                </div>

                {/* 5-Slot Grid for Dealer Poses */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {DEALER_POSES_SCHEMA.map(pose => {
                    const currentPose = dealerPoses[pose.key]
                    const hasImage = Boolean(currentPose?.previewUrl)
                    const isSelectedPreview = activeDealerPreviewPose === pose.key

                    return (
                      <div
                        key={pose.key}
                        className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between relative ${
                          isSelectedPreview
                            ? 'bg-amber-400/10 border-amber-400 shadow-md shadow-amber-500/10 ring-1 ring-amber-400/40'
                            : hasImage
                              ? 'bg-black/40 border-white/20 hover:border-white/40'
                              : 'bg-black/20 border-dashed border-white/15 hover:border-white/30'
                        }`}
                      >
                        {/* Pose Header */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Icon name={pose.icon} className="text-amber-400 text-base flex-shrink-0" />
                            <span className="text-xs font-bold text-white truncate">{pose.label}</span>
                          </div>
                          <span
                            className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase ${
                              hasImage
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-white/10 text-white/40'
                            }`}
                          >
                            {hasImage ? 'Đã có' : 'Chưa có'}
                          </span>
                        </div>

                        {/* Thumbnail Viewport */}
                        <div
                          onClick={() => {
                            if (hasImage) setActiveDealerPreviewPose(pose.key)
                          }}
                          className={`w-full aspect-[4/3] rounded-xl overflow-hidden bg-black/60 flex items-center justify-center relative cursor-pointer border ${
                            isSelectedPreview ? 'border-amber-400' : 'border-white/10'
                          }`}
                        >
                          {hasImage ? (
                            <img
                              src={currentPose.previewUrl}
                              alt={pose.label}
                              className={`w-full h-full object-cover transition-transform duration-300 hover:scale-105 ${
                                pose.key === 'avatar' ? 'rounded-full p-2' : ''
                              }`}
                            />
                          ) : (
                            <div className="flex flex-col items-center justify-center text-white/30 p-2 text-center">
                              <Icon name="image" className="text-2xl mb-1" />
                              <span className="text-[10px]">Chưa tải ảnh</span>
                            </div>
                          )}

                          {isSelectedPreview && (
                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-amber-400 text-slate-950 text-[9px] font-black uppercase">
                              Đang xem
                            </span>
                          )}
                        </div>

                        <p className="text-[10px] text-white/50 mt-2 mb-3 min-h-[28px] line-clamp-2">
                          {pose.desc}
                        </p>

                        {/* Action buttons */}
                        <div className="flex items-center gap-1.5 pt-2 border-t border-white/10">
                          <input
                            type="file"
                            accept="image/*"
                            id={`pose-file-${pose.key}`}
                            onChange={e =>
                              e.target.files?.[0] &&
                              handleDealerPoseFileSelect(pose.key, e.target.files[0])
                            }
                            className="hidden"
                          />
                          <label
                            htmlFor={`pose-file-${pose.key}`}
                            className="flex-1 py-1 px-2 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-bold text-center cursor-pointer transition-colors"
                          >
                            {hasImage ? 'Đổi ảnh' : 'Chọn ảnh'}
                          </label>

                          {hasImage && (
                            <>
                              <button
                                type="button"
                                title="Cắt và căn chỉnh tỉ lệ 1:1"
                                onClick={() => handleOpenPoseCropper(pose.key)}
                                className="p-1 px-1.5 rounded-lg bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 text-[11px] font-bold border border-amber-400/30 transition-colors flex items-center gap-0.5"
                              >
                                <Icon name="crop" className="text-xs" />
                                <span>Cắt</span>
                              </button>
                              <button
                                type="button"
                                title="Xóa ảnh này"
                                onClick={() => handleClearPose(pose.key)}
                                className="p-1 px-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-[11px] transition-colors"
                              >
                                <Icon name="close" className="text-xs" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Case B: Deck Zip / Files */}
            {assetConfig.hasDeckZip && (
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

            {/* Case C: Generic Image Texture & Video Review */}
            {(assetConfig.hasImage || assetConfig.hasVideo) && (
              <div className="space-y-4">
                <div
                  className={`grid gap-4 ${
                    assetConfig.hasImage && assetConfig.hasVideo
                      ? 'grid-cols-1 md:grid-cols-2'
                      : 'grid-cols-1'
                  }`}
                >
                  {/* Asset File (Texture, Sprite, Frame) */}
                  {assetConfig.hasImage && (
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
                          {localAssetFile
                            ? localAssetFile.name
                            : localAssetPreviewUrl
                              ? 'Đã có tệp ảnh (Bấm để thay thế)'
                              : 'Tải ảnh tài nguyên (Texture / Frame / Icon)'}
                        </span>
                        <span className="text-[10px] text-white/50 mt-1">Chọn từ máy tính (PNG, JPG, WebP)</span>
                      </label>
                      {localAssetPreviewUrl && (
                        <div className="mt-3 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setCropperSource(localAssetPreviewUrl)
                              setCropTargetPoseKey(null)
                              setCropShape('square')
                              setShowCropperModal(true)
                            }}
                            className="text-[11px] font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-400/15 border border-amber-400/30"
                          >
                            <Icon name="crop" className="text-xs" />
                            <span>Cắt & Căn Chỉnh Khung</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Video Review File */}
                  {assetConfig.hasVideo && (
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
                          {localVideoFile
                            ? localVideoFile.name
                            : localVideoPreviewUrl
                              ? 'Đã có video review (Bấm để thay)'
                              : 'Tải Video Review (MP4, WebM)'}
                        </span>
                        <span className="text-[10px] text-white/50 mt-1">Tùy chọn - Hiển thị demo chuyển động</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Video Player Preview if selected */}
                {assetConfig.hasVideo && localVideoPreviewUrl && (
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

            {/* Case D: SOUND */}
            {assetConfig.hasSound && (
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
                          {localSoundFile?.name || 'Tệp âm thanh'}
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

            {/* Empty state when all toggles are turned off */}
            {!assetConfig.hasImage && !assetConfig.hasVideo && !assetConfig.hasSound && !assetConfig.hasPoses && !assetConfig.hasDeckZip && (
              <div className="p-8 text-center rounded-2xl bg-black/30 border border-dashed border-white/20 text-white/40">
                <Icon name="upload_file" className="text-3xl mx-auto mb-2 text-white/20" />
                <p className="text-xs">Vui lòng bật ít nhất một loại tệp tài nguyên từ thanh cấu hình bên trên để tải lên.</p>
              </div>
            )}
          </div>

          {/* Step 3: Giá Bán & Quyền Sở Hữu */}
          <div className="p-6 rounded-3xl bg-[#140a24]/95 border border-white/10 shadow-xl space-y-4">
            <h3 className="font-headline font-bold text-base text-white flex items-center gap-2 pb-3 border-b border-white/10">
              <Icon name="monetization_on" className="text-amber-400 text-xl" />
              <span>3. Thiết Lập Giá Bán & Quyền Sở Hữu</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="min-h-[26px] flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-white/80">
                    Giá VIP Coin (Trong Game): <span className="text-amber-400">*</span>
                  </label>
                  <span className="text-[11px] text-amber-300/70 font-mono">1 VIP ≈ 1.000 VNĐ</span>
                </div>
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
                <span className="text-[11px] text-amber-300/80 mt-1.5 block">
                  Đơn vị: {formatVipCoin(priceVipCoin)} VIP Coin
                </span>
              </div>

              <div>
                <div className="min-h-[26px] flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-white/80">
                    Giá niêm yết tương đương (VNĐ): <span className="text-amber-400">*</span>
                  </label>
                  <span className="text-[11px] text-white/40">Tự động đồng bộ</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={priceVnd}
                  onChange={e => handlePriceVndChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-black/50 border border-white/15 text-sm text-white focus:outline-none focus:border-amber-400 font-mono"
                />
                <span className="text-[11px] text-white/50 mt-1.5 block">
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

        {/* Right Column (4 cols): Category-Aware Live Preview */}
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

            {/* Category-Aware Preview Display (Ảnh 1 & Ảnh 2 Fix) */}
            <div className="w-full aspect-[4/3] rounded-2xl bg-black/70 border border-white/15 p-3 flex flex-col items-center justify-center relative overflow-hidden group shadow-inner">
              {/* Case 1: SOUND */}
              {catCode === 'SOUND' ? (
                <div className="w-full h-full flex flex-col items-center justify-center relative p-4 text-center">
                  {/* Vinyl spinning disk effect */}
                  <div
                    className={`w-28 h-28 rounded-full border-4 border-purple-500/40 bg-gradient-to-tr from-purple-900 via-black to-purple-800 flex items-center justify-center shadow-xl relative transition-transform ${
                      isPlayingAudio ? 'animate-spin' : ''
                    }`}
                    style={{ animationDuration: '4s' }}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#140a24] border-2 border-purple-400 flex items-center justify-center">
                      <Icon name="music_note" className="text-purple-300 text-base" />
                    </div>
                  </div>

                  {/* Sound Wave Animation Bars */}
                  <div className="flex items-center gap-1 mt-3 h-5">
                    {[0.4, 0.9, 0.6, 1.0, 0.7, 0.3, 0.8].map((h, i) => (
                      <span
                        key={i}
                        className="w-1 bg-purple-400 rounded-full transition-all duration-200"
                        style={{
                          height: isPlayingAudio ? `${h * 20}px` : '4px',
                        }}
                      />
                    ))}
                  </div>

                  <span className="text-xs font-bold text-purple-200 mt-2 truncate max-w-[200px]">
                    {localSoundFile?.name || name || 'Hiệu Ứng Âm Thanh'}
                  </span>

                  {localSoundPreviewUrl && (
                    <button
                      type="button"
                      onClick={handleTogglePlayAudio}
                      className="mt-2 px-3 py-1 rounded-full bg-purple-500 hover:bg-purple-400 text-slate-950 text-xs font-black flex items-center gap-1 shadow-md transition-transform active:scale-95"
                    >
                      <Icon name={isPlayingAudio ? 'pause' : 'play_arrow'} className="text-sm" />
                      <span>{isPlayingAudio ? 'Tạm Dừng' : 'Phát Thử'}</span>
                    </button>
                  )}
                </div>
              ) : catCode === 'DEALER' ? (
                /* Case 2: DEALER Multi-Pose Preview */
                <div className="w-full h-full flex flex-col items-center justify-between relative">
                  {/* Stage Switcher Pills */}
                  <div className="w-full flex items-center justify-center gap-1 p-1 bg-black/60 rounded-xl border border-white/10 z-10">
                    {DEALER_POSES_SCHEMA.slice(0, 4).map(pose => (
                      <button
                        key={pose.key}
                        type="button"
                        onClick={() => {
                          setIsAutoAnimatingDealer(false)
                          setActiveDealerPreviewPose(pose.key)
                        }}
                        className={`flex-1 py-1 px-1 rounded-lg text-[10px] font-bold transition-all text-center truncate ${
                          activeDealerPreviewPose === pose.key
                            ? 'bg-amber-400 text-slate-950 shadow-sm'
                            : 'text-white/60 hover:text-white'
                        }`}
                      >
                        {pose.shortName}
                      </button>
                    ))}
                  </div>

                  {/* Pose Preview Image */}
                  <div className="w-full flex-1 flex items-center justify-center relative overflow-hidden my-2">
                    {currentDealerPreviewUrl ? (
                      <img
                        key={activeDealerPreviewPose}
                        src={currentDealerPreviewUrl}
                        alt="Dealer Stage Preview"
                        className="max-h-full max-w-full object-contain rounded-xl drop-shadow-2xl animate-fade-in"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-white/30 text-center">
                        <Icon name="face" className="text-4xl text-amber-400/40 mb-1" />
                        <span className="text-xs">Chưa có ảnh tư thế này</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom control: Auto Play Demo toggle & avatar badge */}
                  <div className="w-full flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAutoAnimatingDealer(!isAutoAnimatingDealer)}
                      className={`text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 border transition-colors ${
                        isAutoAnimatingDealer
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                          : 'bg-white/10 text-white/70 border-white/10 hover:bg-white/20'
                      }`}
                    >
                      <Icon name={isAutoAnimatingDealer ? 'pause' : 'play_arrow'} className="text-xs" />
                      <span>{isAutoAnimatingDealer ? 'Đang chạy demo' : '▶ Chạy thử 4 tư thế'}</span>
                    </button>

                    {dealerPoses.avatar?.previewUrl && (
                      <div
                        onClick={() => setActiveDealerPreviewPose('avatar')}
                        title="Xem Avatar Bàn Tròn"
                        className="flex items-center gap-1.5 cursor-pointer bg-black/60 px-2 py-0.5 rounded-full border border-amber-400/40"
                      >
                        <div className="w-5 h-5 rounded-full overflow-hidden border border-amber-400">
                          <img
                            src={dealerPoses.avatar.previewUrl}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[10px] font-bold text-amber-300">Avatar</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : catCode === 'ALL_IN_EFFECT' || catCode === 'VICTORY_EFFECT' ? (
                /* Case 3: VIDEO OR PARTICLE EFFECT */
                localVideoPreviewUrl ? (
                  <video
                    src={localVideoPreviewUrl}
                    controls
                    autoPlay
                    loop
                    muted
                    className="w-full h-full rounded-xl object-contain bg-black"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-3">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 mb-2 shadow-lg">
                      {localAssetPreviewUrl ? (
                        <img
                          src={localAssetPreviewUrl}
                          alt="Effect"
                          className="w-full h-full object-contain rounded-2xl"
                        />
                      ) : (
                        <Icon name="auto_awesome" className="text-3xl" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-cyan-200">
                      {name || 'Hiệu Ứng Chiến Thắng / All-In'}
                    </span>
                    <span className="text-[10px] text-white/40 mt-0.5">
                      {localVideoPreviewUrl ? 'Video sẵn sàng' : 'Chưa gắn video review'}
                    </span>
                  </div>
                )
              ) : (
                /* Case 4: Default CosmeticRenderer (Only CARD_SKIN or Table falls back to this) */
                <CosmeticRenderer
                  categoryCode={catCode}
                  previewUrl={localAssetPreviewUrl || manualAssetUrl}
                  assetUrl={localAssetPreviewUrl || manualAssetUrl}
                  productName={name}
                  rank="A"
                  suit="S"
                  interactive
                />
              )}

              <span className="absolute bottom-2 left-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/70 text-white/80 border border-white/10 z-10 backdrop-blur-sm">
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
                variant={isEditing ? 'primary' : 'gold'}
                size="lg"
                icon={isEditing ? 'save' : 'publish'}
                loading={isSubmitting}
                onClick={handleSubmit}
                className="w-full justify-center"
              >
                {isSubmitting
                  ? submitStep || 'Đang Xử Lý...'
                  : isEditing
                    ? 'Lưu Thay Đổi'
                    : 'Lưu Sản Phẩm Ngay'}
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
        cropShape={cropShape}
        onClose={() => setShowCropperModal(false)}
        onCropComplete={handleCropComplete}
      />
    </div>
  )
}
