import { useState, useMemo, useRef, useEffect } from 'react'
import { Icon, Button, useToast } from '@/shared/ui'
import { formatVipCoin, formatVnd } from '../utils/adminFormatters'
import CosmeticRenderer from '@/features/shop/components/CosmeticRenderer'
import AddCategoryModal from './AddCategoryModal'
import ImageCropperModal from './ImageCropperModal'
import { uploadProductSound, deleteProductSound, uploadAssetFile } from '../services/adminShopService'

// The service needs a link to create a product, but a new deck has none until its ZIP is processed right after;
// processing replaces this marker with the deck's own link.
const PENDING_DECK_ASSET_URL = 'pending://deck-upload'

const DEALER_POSES_SCHEMA = [
  {
    key: 'idle',
    label: '1. Idle',
    shortName: 'Idle',
    desc: 'Standing pose while players think or bet.',
    icon: 'accessibility_new',
    badge: 'Default',
  },
  {
    key: 'deal',
    label: '2. Deal',
    shortName: 'Deal',
    desc: 'Dealing cards to the players.',
    icon: 'style',
    badge: 'Action',
  },
  {
    key: 'flip',
    label: '3. Flip',
    shortName: 'Flip',
    desc: 'Turning the flop, turn, river or showdown cards.',
    icon: 'flip',
    badge: 'Action',
  },
  {
    key: 'win',
    label: '4. Win',
    shortName: 'Win',
    desc: 'Celebrating when someone wins the pot.',
    icon: 'celebration',
    badge: 'Effect',
  },
  {
    key: 'avatar',
    label: '5. Round avatar (table)',
    shortName: 'Round avatar',
    desc: 'Dealer portrait shown in the table corner and in the shop.',
    icon: 'account_circle',
    badge: 'Identity',
  },
]

export const CATEGORY_ASSET_RULES = {
  CARD_SKIN: {
    name: 'Card deck skin',
    required: ['hasDeckZip'],
    allowed: ['hasDeckZip', 'hasVideo'],
    disallowedReasons: {
      hasImage: 'Card skins upload as a 52-card ZIP, not a single image',
      hasSound: 'Card skins don’t have their own MP3',
      hasPoses: 'Only dealers have the 5 poses',
    },
    default: { hasImage: false, hasVideo: false, hasSound: false, hasPoses: false, hasDeckZip: true },
    guide: 'Card deck skins need a ZIP with 52 or 53 cards (52 faces plus a back) and an optional preview video.',
  },
  DEALER: {
    name: 'Dealer',
    required: ['hasPoses'],
    allowed: ['hasPoses', 'hasVideo'],
    disallowedReasons: {
      hasImage: 'Dealers use 5 poses instead of a single image',
      hasSound: 'Dealers don’t have their own sound file',
      hasDeckZip: 'A dealer isn’t a card deck',
    },
    default: { hasImage: false, hasVideo: false, hasSound: false, hasPoses: true, hasDeckZip: false },
    guide: 'Dealers need 5 poses: idle, deal, flip, win and the table avatar.',
  },
  COIN_SKIN: {
    name: 'Chip skin',
    required: ['hasImage'],
    allowed: ['hasImage', 'hasVideo'],
    disallowedReasons: {
      hasSound: 'Chips don’t have an MP3 (sounds have their own category)',
      hasPoses: 'Chips don’t have dealer poses',
      hasDeckZip: 'Chips don’t use a card ZIP',
    },
    default: { hasImage: true, hasVideo: false, hasSound: false, hasPoses: false, hasDeckZip: false },
    guide: 'Chip skins need one round chip-face texture (PNG/WebP) and an optional 3D preview video.',
  },
  TABLE: {
    name: 'Table',
    required: ['hasImage'],
    allowed: ['hasImage', 'hasVideo'],
    disallowedReasons: {
      hasSound: 'Tables don’t have their own MP3',
      hasPoses: 'Tables don’t have dealer poses',
      hasDeckZip: 'Tables don’t use a card ZIP',
    },
    default: { hasImage: true, hasVideo: false, hasSound: false, hasPoses: false, hasDeckZip: false },
    guide: 'Tables need a felt image at the standard ratio and an optional lighting preview video.',
  },
  FRAME: {
    name: 'Khung Avatar',
    required: ['hasImage'],
    allowed: ['hasImage', 'hasVideo'],
    disallowedReasons: {
      hasSound: 'Avatar frames don’t have an MP3',
      hasPoses: 'Avatar frames don’t have dealer poses',
      hasDeckZip: 'Avatar frames don’t use a card ZIP',
    },
    default: { hasImage: true, hasVideo: false, hasSound: false, hasPoses: false, hasDeckZip: false },
    guide: 'Avatar frames need a transparent round PNG (use the crop tool) and an optional effect video.',
  },
  SOUND: {
    name: 'Sound',
    required: ['hasSound', 'hasImage'],
    allowed: ['hasSound', 'hasImage'],
    disallowedReasons: {
      hasVideo: 'Sounds don’t use a preview video',
      hasPoses: 'Sounds don’t have dealer poses',
      hasDeckZip: 'Sounds don’t use a card ZIP',
    },
    default: { hasImage: true, hasVideo: false, hasSound: true, hasPoses: false, hasDeckZip: false },
    guide: 'Sounds need an MP3/WAV file (under 2 MB) and one icon for the shop.',
  },
  ALL_IN_EFFECT: {
    name: 'All-in effect',
    required: ['hasImage'],
    allowed: ['hasImage', 'hasVideo'],
    disallowedReasons: {
      hasSound: 'All-in effects play through video or particle shaders',
      hasPoses: 'Only dealers have poses',
      hasDeckZip: 'All-in effects don’t use a card ZIP',
    },
    default: { hasImage: true, hasVideo: true, hasSound: false, hasPoses: false, hasDeckZip: false },
    guide: 'All-in effects need a texture or icon; a preview video (MP4/WebM) of the effect is recommended.',
  },
  VICTORY_EFFECT: {
    name: 'Win effect',
    required: ['hasImage'],
    allowed: ['hasImage', 'hasVideo'],
    disallowedReasons: {
      hasSound: 'Win effects play through video or particle shaders',
      hasPoses: 'Only dealers have poses',
      hasDeckZip: 'Win effects don’t use a card ZIP',
    },
    default: { hasImage: true, hasVideo: true, hasSound: false, hasPoses: false, hasDeckZip: false },
    guide: 'Win effects need a texture or icon; a preview video of the fireworks or coin rain is recommended.',
  },
  EMOJI: {
    name: 'Emote',
    required: ['hasImage'],
    allowed: ['hasImage', 'hasVideo'],
    disallowedReasons: {
      hasSound: 'Emotes don’t have a sound file',
      hasPoses: 'Emotes don’t have dealer poses',
      hasDeckZip: 'Emotes don’t use a card ZIP',
    },
    default: { hasImage: true, hasVideo: false, hasSound: false, hasPoses: false, hasDeckZip: false },
    guide: 'Emotes need a transparent PNG/WebP and an optional short looping video.',
  },
}

export const ASSET_CONFIG_ITEMS = [
  { key: 'hasImage', label: 'Texture / icon image', icon: 'image' },
  { key: 'hasVideo', label: 'Video preview (MP4)', icon: 'videocam' },
  { key: 'hasSound', label: 'Sound (MP3)', icon: 'volume_up' },
  { key: 'hasPoses', label: 'Poses', icon: 'accessibility_new' },
  { key: 'hasDeckZip', label: '52-card deck (ZIP)', icon: 'style' },
]

export const DEFAULT_FALLBACK_RULE = {
  name: 'Custom category',
  isCustom: true,
  required: [],
  allowed: ['hasImage', 'hasVideo', 'hasSound', 'hasPoses', 'hasDeckZip'],
  disallowedReasons: {},
  default: { hasImage: true, hasVideo: false, hasSound: false, hasPoses: false, hasDeckZip: false },
  guide: 'Custom category: turn on whichever asset types this item needs.',
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

  // Asset Requirements Configuration (All 5 options unlocked; validated on Save)
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
          ASSET_CONFIG_ITEMS.forEach(item => {
            if (meta.assetConfig[item.key] !== undefined) {
              initial[item.key] = Boolean(meta.assetConfig[item.key])
            }
          })
        }
      } catch (err) {
        console.error('Error parsing assetConfig from metadata:', err)
      }
    }
    return initial
  })

  // When category changes, auto-select default asset configuration for that category
  const prevCatCodeRef = useRef(catCode)
  useEffect(() => {
    if (prevCatCodeRef.current !== catCode) {
      prevCatCodeRef.current = catCode
      setAssetConfig({ ...categoryRule.default })
    }
  }, [catCode, categoryRule])

  // Allow toggling all 5 asset options freely; validation occurs on Save
  const handleToggleAssetConfig = key => {
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
  const [localSoundPreviewUrl, setLocalSoundPreviewUrl] = useState(() => {
    if (editingProduct?.soundUrl) return editingProduct.soundUrl
    if (editingProduct?.metadata) {
      try {
        const meta =
          typeof editingProduct.metadata === 'string'
            ? JSON.parse(editingProduct.metadata)
            : editingProduct.metadata
        return meta?.soundUrl || meta?.sound_url || ''
      } catch {
        return ''
      }
    }
    return ''
  })
  const [shouldDeleteExistingSound, setShouldDeleteExistingSound] = useState(false)

  // Card Skin specific files & live preview URLs
  const [selectedZipFile, setSelectedZipFile] = useState(null)
  const [isCardPreviewFlipped, setIsCardPreviewFlipped] = useState(false)
  const [zipPreviewCards, setZipPreviewCards] = useState(() => {
    let frontUrl = ''
    let backUrl = editingProduct?.previewUrl || ''
    if (editingProduct?.metadata) {
      try {
        const meta =
          typeof editingProduct.metadata === 'string'
            ? JSON.parse(editingProduct.metadata)
            : editingProduct.metadata
        if (meta?.cards) {
          frontUrl = meta.cards.AS || meta.cards['AS'] || Object.values(meta.cards)[0] || ''
        }
        if (meta?.cardBackUrl || meta?.card_back_url || meta?.previewUrl) {
          backUrl = meta.cardBackUrl || meta.card_back_url || meta.previewUrl
        }
      } catch {
        // ignore
      }
    }
    return { frontUrl, backUrl }
  })

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
      setLocalAssetPreviewUrl(
        editingProduct.assetUrl && !editingProduct.assetUrl.includes('deck_atlas')
          ? editingProduct.assetUrl
          : editingProduct.previewUrl || ''
      )
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
          const frontUrl = meta?.cards?.AS || meta?.cards?.['AS'] || (meta?.cards ? Object.values(meta.cards)[0] : '') || ''
          const backUrl = meta?.cardBackUrl || meta?.card_back_url || meta?.previewUrl || editingProduct.previewUrl || ''
          setZipPreviewCards({ frontUrl, backUrl })
          const existingSound = editingProduct.soundUrl || meta?.soundUrl || meta?.sound_url || ''
          setLocalSoundPreviewUrl(existingSound)
          setShouldDeleteExistingSound(false)
        } catch (e) {
          console.error('Error parsing product metadata on change:', e)
        }
      } else if (editingProduct.soundUrl) {
        setLocalSoundPreviewUrl(editingProduct.soundUrl)
        setShouldDeleteExistingSound(false)
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

    notify(`Added ${Math.min(files.length, 5)} images to the dealer poses.`, { type: 'success' })
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
      notify('Sound files must be 2 MB or smaller', { type: 'error' })
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

  const handleZipFileSelect = async e => {
    const file = e.target.files?.[0]
    if (!file) return
    setSelectedZipFile(file)

    // Extract AS.png (front) and BACK.png (back) in browser for instant Live Preview
    try {
      const arrayBuf = await file.arrayBuffer()
      const bytes = new Uint8Array(arrayBuf)
      const view = new DataView(arrayBuf)

      // Locate End of Central Directory (EOCD: 0x06054b50)
      let eocdOffset = -1
      const minEocd = Math.max(0, bytes.length - 65557)
      for (let i = bytes.length - 22; i >= minEocd; i--) {
        if (view.getUint32(i, true) === 0x06054b50) {
          eocdOffset = i
          break
        }
      }

      if (eocdOffset >= 0) {
        const totalEntries = view.getUint16(eocdOffset + 10, true)
        let cdPos = view.getUint32(eocdOffset + 16, true)
        const decoder = new TextDecoder('utf-8')
        let extractedFront = ''
        let extractedBack = ''

        const extractEntryBlobUrl = async (method, compBytes) => {
          if (method === 0) {
            return URL.createObjectURL(new Blob([compBytes], { type: 'image/png' }))
          }
          if (method === 8 && typeof DecompressionStream !== 'undefined') {
            const ds = new DecompressionStream('deflate-raw')
            const stream = new Blob([compBytes]).stream().pipeThrough(ds)
            const decompressedBlob = await new Response(stream).blob()
            return URL.createObjectURL(new Blob([decompressedBlob], { type: 'image/png' }))
          }
          return ''
        }

        for (let idx = 0; idx < totalEntries && cdPos + 46 <= bytes.length; idx++) {
          if (view.getUint32(cdPos, true) !== 0x02014b50) break
          const method = view.getUint16(cdPos + 10, true)
          const compSize = view.getUint32(cdPos + 20, true)
          const nameLen = view.getUint16(cdPos + 28, true)
          const extraLen = view.getUint16(cdPos + 30, true)
          const commentLen = view.getUint16(cdPos + 32, true)
          const localHdrOffset = view.getUint32(cdPos + 42, true)
          const entryName = decoder.decode(bytes.subarray(cdPos + 46, cdPos + 46 + nameLen))
          cdPos += 46 + nameLen + extraLen + commentLen

          const baseName = entryName.split('/').pop().replace(/\.[^.]+$/, '').toUpperCase()
          if (baseName === 'BACK' || baseName === 'AS' || (!extractedFront && baseName === 'AH')) {
            const localNameLen = view.getUint16(localHdrOffset + 26, true)
            const localExtraLen = view.getUint16(localHdrOffset + 28, true)
            const dataStart = localHdrOffset + 30 + localNameLen + localExtraLen
            const compBytes = bytes.subarray(dataStart, dataStart + compSize)
            const url = await extractEntryBlobUrl(method, compBytes)
            if (url) {
              if (baseName === 'BACK') extractedBack = url
              else if (baseName === 'AS' || !extractedFront) extractedFront = url
            }
          }
        }

        if (extractedFront || extractedBack) {
          setZipPreviewCards(prev => ({
            frontUrl: extractedFront || prev.frontUrl,
            backUrl: extractedBack || prev.backUrl,
          }))
        }
      }
    } catch (err) {
      console.warn('Could not preview zip entries in browser:', err)
    }
  }

  // Handle Cropper Result
  const handleCropComplete = (croppedFile, dataUrl) => {
    if (cropTargetPoseKey && cropTargetPoseKey !== 'generic') {
      setDealerPoses(prev => ({
        ...prev,
        [cropTargetPoseKey]: { file: croppedFile, previewUrl: dataUrl },
      }))
      notify(`Cropped the “${cropTargetPoseKey}” pose.`, { type: 'success' })
    } else {
      setLocalAssetFile(croppedFile)
      setLocalAssetPreviewUrl(dataUrl)
      notify('Image cropped.', { type: 'success' })
    }
    setShowCropperModal(false)
  }

  // Submit Handler (Create or Update)
  const handleSubmit = async e => {
    e.preventDefault()
    if (!name.trim()) {
      notify('Enter a product name', { type: 'error' })
      return
    }
    if (!selectedCategoryId) {
      notify('Choose a category', { type: 'error' })
      return
    }

    // Validate assetConfig on Save
    const hasAnyEnabled = ASSET_CONFIG_ITEMS.some(item => Boolean(assetConfig[item.key]))
    if (!hasAnyEnabled) {
      notify('Turn on at least one asset type.', { type: 'error' })
      return
    }

    if (!categoryRule.isCustom) {
      // 1. Check if admin enabled any incompatible asset type for this category
      for (const item of ASSET_CONFIG_ITEMS) {
        if (assetConfig[item.key] && !categoryRule.allowed.includes(item.key)) {
          const reason =
            categoryRule.disallowedReasons?.[item.key] ||
            `${currentCategory?.name || catCode} doesn’t support this file type`
          notify(
            `“${item.label}” isn’t valid for ${currentCategory?.name || catCode} (${reason}). Turn it off before saving.`,
            { type: 'error' }
          )
          return
        }
      }

      // 2. Check if admin turned off any required asset type for this category
      for (const item of ASSET_CONFIG_ITEMS) {
        if (!assetConfig[item.key] && categoryRule.required.includes(item.key)) {
          notify(
            `${currentCategory?.name || catCode} requires “${item.label}”. Turn it on before saving.`,
            { type: 'error' }
          )
          return
        }
      }
    }

    // 3. Each enabled file type needs its file, picked now or kept from the product being edited; otherwise the product
    // is saved without it and shows nothing in the shop or at the table. The video review stays optional. The table
    // shows a dealer from its idle pose, so that pose is the one a dealer cannot go without.
    const filePresent = {
      hasImage: Boolean(localAssetFile || manualAssetUrl.trim()),
      hasSound: Boolean(localSoundFile || localSoundPreviewUrl),
      hasPoses: Boolean(dealerPoses.idle?.previewUrl),
      hasDeckZip: Boolean(selectedZipFile || isEditing),
    }
    const missingFile = ASSET_CONFIG_ITEMS.find(item => assetConfig[item.key] && filePresent[item.key] === false)
    if (missingFile) {
      notify(
        missingFile.key === 'hasPoses'
          ? 'The dealer’s idle pose is missing. Tables need it to show the dealer; add it before saving.'
          : `No file chosen for “${missingFile.label}”. Choose one before saving.`,
        { type: 'error' }
      )
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
        setSubmitStep('Uploading dealer poses to S3…')
        const uploadedPoses = metaObj.poses || {}

        for (const pose of DEALER_POSES_SCHEMA) {
          const key = pose.key
          const poseItem = dealerPoses[key]
          if (poseItem?.file) {
            setSubmitStep(`Uploading pose: ${pose.shortName}…`)
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
        setSubmitStep('Uploading image to S3…')
        const res = await uploadAssetFile(localAssetFile, 'assets')
        if (res?.data?.url) {
          finalAssetUrl = res.data.url
        }
      }

      // 3. Video review upload if active
      if (assetConfig.hasVideo && localVideoFile) {
        setSubmitStep('Uploading preview video to S3…')
        const res = await uploadAssetFile(localVideoFile, 'videos')
        if (res?.data?.url) {
          finalVideoUrl = res.data.url
        }
      }

      if (!finalAssetUrl && assetConfig.hasDeckZip) {
        finalAssetUrl = PENDING_DECK_ASSET_URL
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
        setSubmitStep('Updating product…')
        if (!updateProduct) {
          throw new Error('Product updates aren’t configured')
        }
        await updateProduct(editingProduct.id, productPayload)
        notify(`Updated “${name}”.`, { type: 'success' })
      } else {
        setSubmitStep('Creating product…')
        const created = await createProduct(productPayload)
        productId = created?.data?.id || created?.result?.id || created?.id
        if (!productId) {
          throw new Error('No product ID returned after creation')
        }
        notify(`Created “${name}”.`, { type: 'success' })
      }

      // Sound upload or removal
      if (assetConfig.hasSound && localSoundFile && productId) {
        setSubmitStep('Attaching sound…')
        await uploadProductSound(productId, localSoundFile)
      } else if (
        isEditing &&
        productId &&
        (shouldDeleteExistingSound || (!assetConfig.hasSound && editingProduct?.soundUrl))
      ) {
        setSubmitStep('Removing old sound…')
        await deleteProductSound(productId)
      }

      // Card Skin Ingestion if active and new ZIP file selected
      if (assetConfig.hasDeckZip && productId && selectedZipFile) {
        setSubmitStep('Unpacking and uploading the 52-card deck…')
        await uploadDeckSkinZip(productId, selectedZipFile)
      }

      onSuccess?.()
    } catch (err) {
      notify(err.message || (isEditing ? 'Couldn’t update the product' : 'Couldn’t create the product'), {
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
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                isEditing
                  ? 'bg-primary-container/20 text-primary border border-primary-container/40'
                  : 'bg-tertiary/20 text-tertiary-fixed border border-tertiary/40'
              }`}
            >
              {isEditing ? 'Editing' : 'New'}
            </span>
            <h2 className="font-headline font-bold text-xl text-white flex items-center gap-2">
              <Icon
                name={isEditing ? 'edit_note' : 'add_circle'}
                className={isEditing ? 'text-primary text-2xl' : 'text-tertiary text-2xl'}
              />
              <span>
                {isEditing ? `Edit item: ${editingProduct.name}` : 'Add an item to the shop'}
              </span>
            </h2>
          </div>
          <p className="text-xs text-white/50 mt-1">
            {isEditing
              ? 'Update the product’s tier, price and assets'
              : 'Assets adapt to the item’s category'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant={isEditing ? 'primary' : 'gold'}
            size="sm"
            icon={isEditing ? 'save' : 'publish'}
            loading={isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting
              ? submitStep || 'Working…'
              : isEditing
                ? 'Save changes'
                : 'Save product'}
          </Button>
        </div>
      </div>

      {/* Main Layout (8 cols form + 4 cols sticky preview) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Dynamic Form Fields */}
        <div className="lg:col-span-8 space-y-6">
          {/* Step 1: Danh Mục & Nhận Diện */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest/95 border border-white/10 shadow-raised space-y-4">
            <h3 className="font-headline font-bold text-base text-white flex items-center gap-2 pb-3 border-b border-white/10">
              <Icon name="category" className="text-tertiary text-xl" />
              <span>1. Category and details</span>
            </h3>

            {/* Row 1: Category Selector & Product Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="min-h-[26px] flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-white/80">
                    Category: <span className="text-tertiary">*</span>
                  </label>
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => setShowAddCategoryModal(true)}
                      className="text-[11px] font-bold text-tertiary hover:text-tertiary-fixed flex items-center gap-1 transition-colors px-2 py-0.5 rounded-lg bg-tertiary/10 hover:bg-tertiary/20 border border-tertiary/30"
                    >
                      <Icon name="add" className="text-sm" />
                      <span>+ New category</span>
                    </button>
                  )}
                </div>
                <div className="relative">
                  <select
                    value={selectedCategoryId}
                    onChange={e => setSelectedCategoryId(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-background border border-tertiary/40 text-sm font-bold text-white focus:outline-none focus:border-tertiary transition-colors cursor-pointer"
                  >
                    {categories.map(c => (
                      <option key={c.id || c.code} value={c.id}>
                        {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                  <Icon
                    name={getCatIcon(catCode)}
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-tertiary text-lg pointer-events-none"
                  />
                </div>
              </div>

              <div>
                <div className="min-h-[26px] flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-white/80">
                    Product name: <span className="text-error">*</span>
                  </label>
                  <span className="text-[11px] text-white/40">Required</span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="e.g. Pink Bow Dealer, Neon Table"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-obsidian/50 border border-white/15 text-sm text-white placeholder-white/30 focus:outline-none focus:border-tertiary transition-colors"
                />
              </div>
            </div>

            {/* Row 2: Tier Pills */}
            <div>
              <label className="text-xs font-bold text-white/80 block mb-1.5">
                Tier:
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'NORMAL', label: 'Standard', desc: 'Standard item' },
                  { id: 'VIP', label: 'VIP', desc: 'Effects & shine' },
                  { id: 'SUPER_VIP', label: 'Super VIP', desc: 'Legendary' },
                ].map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setTier(t.id)}
                    className={`p-3 rounded-2xl border text-left transition-all ${
                      tier === t.id
                        ? 'bg-tertiary/15 border-tertiary text-tertiary-fixed shadow-md '
                        : 'bg-obsidian/30 border-white/10 text-white/60 hover:border-white/20'
                    }`}
                  >
                    <span className="font-headline font-bold text-xs block">{t.label}</span>
                    <span className="text-[11px] text-white/40 block mt-0.5">{t.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Row 3: Description */}
            <div>
              <label className="text-xs font-bold text-white/80 block mb-1.5">
                Shop description:
              </label>
              <textarea
                rows={2}
                maxLength={300}
                placeholder="Describe the style, materials and anything exclusive…"
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 rounded-2xl bg-obsidian/50 border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-tertiary transition-colors"
              />
            </div>
          </div>

          {/* Step 2: Dynamic Asset Upload Area */}
          <div className="p-6 sm:p-7 rounded-2xl bg-surface-container-lowest/95 border border-white/10 shadow-raised space-y-5">
            <div className="flex items-center justify-between pb-3.5 border-b border-white/10 flex-wrap gap-2">
              <h3 className="font-headline font-bold text-lg text-white flex items-center gap-2.5">
                <Icon name="upload_file" className="text-tertiary text-2xl" />
                <span>2. Assets for:</span>
                <span className="px-3 py-1 rounded-full bg-tertiary/20 text-tertiary-fixed border border-tertiary/40 text-xs sm:text-sm font-bold">
                  {currentCategory?.name || 'Item'} ({catCode})
                </span>
              </h3>
              <span className="text-xs text-white/60">
                Choose files from your computer · Uploaded to S3 automatically
              </span>
            </div>

            {/* Asset Requirement Configuration Bar */}
            <div className="p-5 rounded-2xl bg-obsidian/40 border border-tertiary/25 space-y-4">
              {/* Smart Category Guidance Banner */}
              <div className="flex items-start gap-3.5 p-4 rounded-xl bg-tertiary/10 border border-tertiary/25">
                <Icon name="auto_awesome" className="text-tertiary text-xl mt-0.5 shrink-0" />
                <div className="text-xs sm:text-sm space-y-1">
                  <div className="font-bold text-tertiary-fixed flex items-center gap-2 flex-wrap">
                    <span>File types tuned for: <strong>{currentCategory?.name || catCode}</strong></span>
                    <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-tertiary/20 text-tertiary-fixed font-mono border border-tertiary/30">
                      {catCode}
                    </span>
                  </div>
                  <p className="text-white/80 text-xs sm:text-[13px] leading-relaxed">
                    {categoryRule.guide}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between flex-wrap gap-2 pt-1">
                <span className="text-sm font-bold text-white/90 flex items-center gap-2">
                  <Icon name="tune" className="text-tertiary text-base" />
                  <span>Asset types:</span>
                </span>
                <span className="text-xs text-white/50">
                  (All types are available; ones that don’t fit this category are flagged when you save)
                </span>
              </div>

              <div className="flex items-center gap-3 flex-wrap pt-0.5">
                {ASSET_CONFIG_ITEMS.map(item => {
                  const isAllowed = categoryRule.isCustom || categoryRule.allowed.includes(item.key)
                  const isRequired = !categoryRule.isCustom && categoryRule.required.includes(item.key)
                  const active = Boolean(assetConfig[item.key])
                  const isWronglyEnabled = active && !isAllowed
                  const isMissingRequired = !active && isRequired
                  const disallowedReason = categoryRule.disallowedReasons?.[item.key]

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleToggleAssetConfig(item.key)}
                      title={
                        isWronglyEnabled
                          ? `Not compatible: ${disallowedReason}`
                          : isRequired
                            ? `Required for ${currentCategory?.name || catCode}`
                            : active
                              ? 'On · Click to turn off'
                              : 'Off · Click to turn on'
                      }
                      className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2.5 border cursor-pointer active:scale-95 ${
                        isWronglyEnabled
                          ? 'bg-error/20 text-error border-error/80 shadow-md '
                          : active && isRequired
                            ? 'bg-tertiary/20 text-tertiary-fixed border-tertiary shadow-md '
                            : active
                              ? 'bg-primary-container/20 text-primary border-primary shadow-md '
                              : isMissingRequired
                                ? 'bg-tertiary/10 text-tertiary-fixed/90 border-tertiary/40 hover:bg-tertiary/20 hover:border-tertiary'
                                : 'bg-white/[0.08] text-white/85 border-white/15 hover:bg-white/[0.14] hover:border-white/30 hover:text-white'
                      }`}
                    >
                      <Icon
                        name={item.icon}
                        className={`text-lg ${
                          isWronglyEnabled
                            ? 'text-error'
                            : active && isRequired
                              ? 'text-tertiary'
                              : active
                                ? 'text-primary'
                                : isMissingRequired
                                  ? 'text-tertiary/80'
                                  : 'text-white/70'
                        }`}
                      />
                      <span>{item.label}</span>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-md font-bold ${
                          isWronglyEnabled
                            ? 'bg-error-container text-white'
                            : active && isRequired
                              ? 'bg-tertiary text-on-tertiary font-bold'
                              : active
                                ? 'bg-primary text-on-tertiary font-bold'
                                : isMissingRequired
                                  ? 'bg-tertiary/20 text-tertiary-fixed border border-tertiary/40'
                                  : 'bg-white/15 text-white/75'
                        }`}
                      >
                        {isWronglyEnabled
                          ? 'Invalid'
                          : active && isRequired
                            ? 'Required'
                            : active
                              ? 'On'
                              : isMissingRequired
                                ? 'Off (required)'
                                : 'Off'}
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
                <div className="p-4 sm:p-5 rounded-2xl bg-tertiary/10 border border-tertiary/30 flex items-center justify-between flex-wrap gap-3">
                  <div className="space-y-1">
                    <span className="text-sm font-bold text-tertiary-fixed flex items-center gap-1.5">
                      <Icon name="bolt" className="text-tertiary text-base" />
                      Upload 4–5 images at once
                    </span>
                    <p className="text-xs text-white/70">
                      Choose 4 or 5 images. They’re assigned in order: 1. Idle → 2. Deal → 3. Flip → 4. Win → 5. Avatar.
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
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-tertiary hover:bg-tertiary-fixed text-on-tertiary text-xs sm:text-sm font-bold shadow-lg cursor-pointer transition-transform active:scale-95"
                    >
                      <Icon name="drive_folder_upload" className="text-lg" />
                      <span>Choose 4–5 images</span>
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
                            ? 'bg-tertiary/10 border-tertiary shadow-md ring-1 ring-tertiary/40'
                            : hasImage
                              ? 'bg-obsidian/40 border-white/20 hover:border-white/40'
                              : 'bg-obsidian/20 border-dashed border-white/15 hover:border-white/30'
                        }`}
                      >
                        {/* Pose Header */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Icon name={pose.icon} className="text-tertiary text-base flex-shrink-0" />
                            <span className="text-xs font-bold text-white truncate">{pose.label}</span>
                          </div>
                          <span
                            className={`text-[11px] font-bold px-1.5 py-0.5 rounded ${
                              hasImage
                                ? 'bg-success/20 text-success border border-success/30'
                                : 'bg-white/10 text-white/40'
                            }`}
                          >
                            {hasImage ? 'Added' : 'Missing'}
                          </span>
                        </div>

                        {/* Thumbnail Viewport */}
                        <div
                          onClick={() => {
                            if (hasImage) setActiveDealerPreviewPose(pose.key)
                          }}
                          className={`w-full aspect-[4/3] rounded-xl overflow-hidden bg-obsidian/60 flex items-center justify-center relative cursor-pointer border ${
                            isSelectedPreview ? 'border-tertiary' : 'border-white/10'
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
                              <span className="text-[11px]">No image</span>
                            </div>
                          )}

                          {isSelectedPreview && (
                            <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-tertiary text-on-tertiary text-[11px] font-bold">
                              Viewing
                            </span>
                          )}
                        </div>

                        <p className="text-[11px] text-white/50 mt-2 mb-3 min-h-[28px] line-clamp-2">
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
                            {hasImage ? 'Replace image' : 'Choose image'}
                          </label>

                          {hasImage && (
                            <>
                              <button
                                type="button"
                                title="Crop to 1:1"
                                onClick={() => handleOpenPoseCropper(pose.key)}
                                className="p-1 px-1.5 rounded-lg bg-tertiary/15 hover:bg-tertiary/25 text-tertiary-fixed text-[11px] font-bold border border-tertiary/30 transition-colors flex items-center gap-0.5"
                              >
                                <Icon name="crop" className="text-xs" />
                                <span>Crop</span>
                              </button>
                              <button
                                type="button"
                                title="Remove image"
                                onClick={() => handleClearPose(pose.key)}
                                className="p-1 px-1.5 rounded-lg bg-error/15 hover:bg-error/25 text-error text-[11px] transition-colors"
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

            {/* Case B: Deck Zip */}
            {assetConfig.hasDeckZip && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-tertiary/40 hover:border-tertiary rounded-2xl p-6 text-center bg-obsidian/30 transition-all">
                  <input
                    type="file"
                    accept=".zip"
                    id="ctrl-panel-zip"
                    onChange={handleZipFileSelect}
                    className="hidden"
                  />
                  <label htmlFor="ctrl-panel-zip" className="cursor-pointer flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-tertiary/10 border border-tertiary/30 flex items-center justify-center text-tertiary mb-3 shadow-inner">
                      <Icon name="folder_zip" className="text-3xl" />
                    </div>
                    <span className="text-sm font-bold text-white">
                      {selectedZipFile ? selectedZipFile.name : 'Click to choose a 52-card ZIP'}
                    </span>
                    <span className="text-xs text-white/50 mt-1 max-w-md">
                      {selectedZipFile
                        ? `${(selectedZipFile.size / 1024).toFixed(1)} KB · Uploads to S3 when you save`
                        : 'The ZIP holds 52 card faces (2H.png, AS.png…) and one back (back.png).'}
                    </span>
                    {selectedZipFile && (
                      <span className="mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-success/20 text-success text-xs font-bold border border-success/30">
                        <Icon name="check_circle" className="text-sm" /> ZIP selected
                      </span>
                    )}
                  </label>
                </div>
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
                    <div className="border-2 border-dashed border-white/20 hover:border-tertiary rounded-2xl p-5 text-center bg-obsidian/30 transition-all flex flex-col justify-center items-center">
                      <input
                        type="file"
                        accept="image/*"
                        id="ctrl-panel-generic-asset"
                        onChange={handleAssetFileSelect}
                        className="hidden"
                      />
                      <label htmlFor="ctrl-panel-generic-asset" className="cursor-pointer flex flex-col items-center">
                        <Icon name="image" className="text-3xl text-tertiary mb-2" />
                        <span className="text-xs font-bold text-white block">
                          {localAssetFile
                            ? localAssetFile.name
                            : localAssetPreviewUrl
                              ? 'Image added (click to replace)'
                              : 'Upload image (texture, frame or icon)'}
                        </span>
                        <span className="text-[11px] text-white/50 mt-1">Choose from your computer (PNG, JPG, WebP)</span>
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
                            className="text-[11px] font-bold text-tertiary-fixed hover:text-tertiary-fixed flex items-center gap-1 px-2.5 py-1 rounded-lg bg-tertiary/15 border border-tertiary/30"
                          >
                            <Icon name="crop" className="text-xs" />
                            <span>Crop</span>
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Video Review File */}
                  {assetConfig.hasVideo && (
                    <div className="border-2 border-dashed border-white/20 hover:border-tertiary rounded-2xl p-5 text-center bg-obsidian/30 transition-all flex flex-col justify-center items-center">
                      <input
                        type="file"
                        accept="video/mp4,video/webm"
                        id="ctrl-panel-generic-video"
                        onChange={handleVideoFileSelect}
                        className="hidden"
                      />
                      <label htmlFor="ctrl-panel-generic-video" className="cursor-pointer flex flex-col items-center">
                        <Icon name="videocam" className="text-3xl text-primary mb-2" />
                        <span className="text-xs font-bold text-white block">
                          {localVideoFile
                            ? localVideoFile.name
                            : localVideoPreviewUrl
                              ? 'Preview video added (click to replace)'
                              : 'Upload preview video (MP4, WebM)'}
                        </span>
                        <span className="text-[11px] text-white/50 mt-1">Optional · shows the animation</span>
                      </label>
                    </div>
                  )}
                </div>

                {/* Video Player Preview if selected */}
                {assetConfig.hasVideo && localVideoPreviewUrl && (
                  <div className="p-3 rounded-2xl bg-obsidian/50 border border-primary/30 space-y-2">
                    <span className="text-xs font-bold text-primary flex items-center gap-1.5">
                      <Icon name="play_circle" className="text-sm" />
                      Preview video:
                    </span>
                    <video
                      src={localVideoPreviewUrl}
                      controls
                      autoPlay
                      loop
                      muted
                      className="w-full max-h-48 rounded-xl object-contain bg-obsidian"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Case D: SOUND */}
            {assetConfig.hasSound && (
              <div className="space-y-4">
                <div className="border-2 border-dashed border-secondary-container/40 hover:border-secondary rounded-2xl p-6 text-center bg-obsidian/30 transition-all">
                  <input
                    type="file"
                    accept=".mp3,.wav,.ogg,audio/mpeg,audio/mp3,audio/wav,audio/ogg"
                    id="ctrl-panel-sound"
                    onChange={handleSoundFileSelect}
                    className="hidden"
                  />
                  <label htmlFor="ctrl-panel-sound" className="cursor-pointer flex flex-col items-center">
                    <div className="w-14 h-14 rounded-2xl bg-secondary-container/10 border border-secondary-container/30 flex items-center justify-center text-secondary mb-3 shadow-inner">
                      <Icon name="volume_up" className="text-3xl" />
                    </div>
                    <span className="text-sm font-bold text-white">
                      {localSoundFile ? localSoundFile.name : 'Choose a sound file (MP3, WAV, OGG)'}
                    </span>
                    <span className="text-xs text-white/50 mt-1">
                      {localSoundFile
                        ? `${(localSoundFile.size / 1024).toFixed(1)} KB · Preview it below`
                        : 'Up to 2 MB. For card flips, all-ins, taunts or dealer sounds.'}
                    </span>
                  </label>
                </div>

                {/* Audio Player Preview */}
                {localSoundPreviewUrl && (
                  <div className="p-4 rounded-2xl bg-secondary-container/10 border border-secondary-container/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={handleTogglePlayAudio}
                        className="w-10 h-10 rounded-full bg-secondary-container hover:bg-secondary text-on-tertiary flex items-center justify-center shadow-lg transition-transform active:scale-95"
                      >
                        <Icon name={isPlayingAudio ? 'pause' : 'play_arrow'} className="text-xl" />
                      </button>
                      <div>
                        <span className="text-xs font-bold text-secondary block">
                          {localSoundFile?.name || 'Sound file'}
                        </span>
                        <span className="text-[11px] text-white/50">
                          {isPlayingAudio ? 'Playing…' : 'Click to preview'}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (audioRef.current) {
                          audioRef.current.pause()
                        }
                        setLocalSoundFile(null)
                        setLocalSoundPreviewUrl('')
                        setIsPlayingAudio(false)
                        if (isEditing) {
                          setShouldDeleteExistingSound(true)
                        }
                      }}
                      className="text-xs text-error hover:text-error font-bold"
                    >
                      Remove file
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Empty state when all toggles are turned off */}
            {!assetConfig.hasImage && !assetConfig.hasVideo && !assetConfig.hasSound && !assetConfig.hasPoses && !assetConfig.hasDeckZip && (
              <div className="p-8 text-center rounded-2xl bg-obsidian/30 border border-dashed border-white/20 text-white/40">
                <Icon name="upload_file" className="text-3xl mx-auto mb-2 text-white/20" />
                <p className="text-xs">Turn on at least one asset type above to upload files.</p>
              </div>
            )}
          </div>

          {/* Step 3: Giá Bán & Quyền Sở Hữu */}
          <div className="p-6 rounded-2xl bg-surface-container-lowest/95 border border-white/10 shadow-raised space-y-4">
            <h3 className="font-headline font-bold text-base text-white flex items-center gap-2 pb-3 border-b border-white/10">
              <Icon name="monetization_on" className="text-tertiary text-xl" />
              <span>3. Price and availability</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="min-h-[26px] flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-white/80">
                    Price in VIP Coin: <span className="text-tertiary">*</span>
                  </label>
                  <span className="text-[11px] text-tertiary-fixed/70 font-mono">1 VIP ≈ 1,000 VND</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    step="10"
                    value={priceVipCoin}
                    onChange={e => handlePriceVipCoinChange(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-obsidian/50 border border-white/15 text-sm text-white focus:outline-none focus:border-tertiary font-mono"
                  />
                  <Icon
                    name="paid"
                    className="absolute left-3.5 top-1/2 -translate-y-1/2 text-tertiary text-lg pointer-events-none"
                  />
                </div>
                <span className="text-[11px] text-tertiary-fixed/80 mt-1.5 block">
                  Unit: {formatVipCoin(priceVipCoin)} VIP Coin
                </span>
              </div>

              <div>
                <div className="min-h-[26px] flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-white/80">
                    Equivalent price (VND): <span className="text-tertiary">*</span>
                  </label>
                  <span className="text-[11px] text-white/40">Synced automatically</span>
                </div>
                <input
                  type="number"
                  min="0"
                  step="10000"
                  value={priceVnd}
                  onChange={e => handlePriceVndChange(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-2xl bg-obsidian/50 border border-white/15 text-sm text-white focus:outline-none focus:border-tertiary font-mono"
                />
                <span className="text-[11px] text-white/50 mt-1.5 block">
                  Converted: {formatVnd(priceVnd)}
                </span>
              </div>
            </div>

            {/* Quick Price Presets */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span className="text-xs text-white/40">Suggested prices:</span>
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
                      ? 'bg-tertiary text-on-tertiary border-tertiary'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Ownership & Flash Sale iOS-style Toggles (Unified UI) */}
            <div className="space-y-3 pt-4 border-t border-white/10">
              {/* Row 1: Exclusive Mode Toggle */}
              <div
                onClick={() => {
                  const next = !isExclusive
                  setIsExclusive(next)
                  if (next) setIsFlashSale(false)
                }}
                className={`flex items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer select-none ${
                  isExclusive
                    ? 'bg-tertiary/10 border-tertiary/35'
                    : 'bg-obsidian/40 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="space-y-1 pr-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Icon
                      name={isExclusive ? 'lock' : 'storefront'}
                      className="text-tertiary text-lg"
                    />
                    <span className="text-sm font-bold text-white">
                      Exclusive (no direct purchase)
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                        isExclusive
                          ? 'bg-tertiary/20 text-tertiary-fixed border-tertiary/40'
                          : 'bg-white/10 text-white/70 border-white/15'
                      }`}
                    >
                      {isExclusive ? 'Exclusive on' : 'On sale'}
                    </span>
                  </div>
                  <p className="text-xs text-white/55">
                    {isExclusive
                      ? 'This product is exclusive, so players can’t buy it directly. Turn the switch off to sell it again.'
                      : 'This product is on sale in the shop. Turn the switch on to make it exclusive.'}
                  </p>
                </div>

                {/* iPhone-style Toggle Switch */}
                <button
                  type="button"
                  role="switch"
                  aria-checked={isExclusive}
                  onClick={e => {
                    e.stopPropagation()
                    const next = !isExclusive
                    setIsExclusive(next)
                    if (next) setIsFlashSale(false)
                  }}
                  className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${
                    isExclusive ? 'bg-tertiary shadow-md ' : 'bg-white/20'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out ${
                      isExclusive ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Row 2: Flash Sale Toggle */}
              <div
                className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-4 ${
                  isFlashSale
                    ? 'bg-tertiary/10 border-tertiary/35'
                    : 'bg-obsidian/40 border-white/10 hover:border-white/20'
                }`}
              >
                <div
                  onClick={() => {
                    const next = !isFlashSale
                    setIsFlashSale(next)
                    if (next) setIsExclusive(false)
                  }}
                  className="flex items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="space-y-1 pr-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Icon name="bolt" className="text-tertiary text-lg" />
                      <span className="text-sm font-bold text-white">
                        Limited-time sale
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                          isFlashSale
                            ? 'bg-tertiary/20 text-tertiary-fixed border-tertiary/40'
                            : 'bg-white/10 text-white/70 border-white/15'
                        }`}
                      >
                        {isFlashSale ? 'Flash sale on' : 'Off'}
                      </span>
                    </div>
                    <p className="text-xs text-white/55">
                      When the countdown ends, the scheduler makes the item exclusive.
                    </p>
                  </div>

                  {/* iPhone-style Toggle Switch */}
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isFlashSale}
                    onClick={e => {
                      e.stopPropagation()
                      const next = !isFlashSale
                      setIsFlashSale(next)
                      if (next) setIsExclusive(false)
                    }}
                    className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none ${
                      isFlashSale ? 'bg-tertiary shadow-md ' : 'bg-white/20'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow-lg ring-0 transition duration-300 ease-in-out ${
                        isFlashSale ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {isFlashSale && (
                  <div className="pt-3 border-t border-tertiary/20 space-y-3">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-xs font-bold text-tertiary-fixed flex items-center gap-1.5">
                        <Icon name="timer" className="text-base" />
                        Sale length:
                      </span>
                      <span className="text-xs text-white/70 font-mono">
                        Ends: {computedSaleExpiresAt ? new Date(computedSaleExpiresAt).toLocaleString() : 'Not set'}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                      {[
                        { id: '12_HOURS', label: '12 hours' },
                        { id: '1_DAY', label: '1 day' },
                        { id: '2_DAYS', label: '2 days' },
                        { id: '3_DAYS', label: '3 days' },
                        { id: '7_DAYS', label: '7 days' },
                        { id: 'CUSTOM', label: 'Custom' },
                      ].map(opt => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setFlashSalePreset(opt.id)}
                          className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                            flashSalePreset === opt.id
                              ? 'bg-tertiary text-on-tertiary border-tertiary shadow-sm '
                              : 'bg-obsidian/40 border-white/10 text-white/70 hover:border-white/20'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    {flashSalePreset === 'CUSTOM' && (
                      <div className="pt-1">
                        <input
                          type="datetime-local"
                          value={customSaleExpiresAt}
                          onChange={e => setCustomSaleExpiresAt(e.target.value)}
                          className="w-full sm:w-72 px-3.5 py-2 rounded-xl bg-obsidian/60 border border-tertiary/30 text-xs text-tertiary-fixed focus:outline-none focus:border-tertiary"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Category-Aware Live Preview */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6">
          <div className="p-6 rounded-2xl bg-surface-container-lowest/95 border border-white/10 shadow-raised space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h4 className="font-headline font-bold text-sm text-white flex items-center gap-2">
                <Icon name="preview" className="text-tertiary text-lg" />
                <span>Shop preview</span>
              </h4>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-tertiary/20 text-tertiary-fixed">
                Live
              </span>
            </div>

            {/* Category-Aware Preview Display (Ảnh 1 & Ảnh 2 Fix) */}
            <div className="w-full aspect-[4/3] rounded-2xl bg-obsidian/70 border border-white/15 p-3 flex flex-col items-center justify-center relative overflow-hidden group shadow-inner">
              {/* Case 1: SOUND */}
              {catCode === 'SOUND' ? (
                <div className="w-full h-full flex flex-col items-center justify-center relative p-4 text-center">
                  {/* Vinyl spinning disk effect */}
                  <div
                    className={`w-28 h-28 rounded-full border-4 border-secondary-container/40 bg-on-secondary-fixed flex items-center justify-center shadow-raised relative transition-transform ${
                      isPlayingAudio ? 'animate-spin' : ''
                    }`}
                    style={{ animationDuration: '4s' }}
                  >
                    <div className="w-10 h-10 rounded-full bg-surface-container-lowest border-2 border-secondary flex items-center justify-center">
                      <Icon name="music_note" className="text-secondary text-base" />
                    </div>
                  </div>

                  {/* Sound Wave Animation Bars */}
                  <div className="flex items-center gap-1 mt-3 h-5">
                    {[0.4, 0.9, 0.6, 1.0, 0.7, 0.3, 0.8].map((h, i) => (
                      <span
                        key={i}
                        className="w-1 bg-secondary rounded-full transition-all duration-200"
                        style={{
                          height: isPlayingAudio ? `${h * 20}px` : '4px',
                        }}
                      />
                    ))}
                  </div>

                  <span className="text-xs font-bold text-secondary mt-2 truncate max-w-[200px]">
                    {localSoundFile?.name || name || 'Sound effect'}
                  </span>

                  {localSoundPreviewUrl && (
                    <button
                      type="button"
                      onClick={handleTogglePlayAudio}
                      className="mt-2 px-3 py-1 rounded-full bg-secondary-container hover:bg-secondary text-on-tertiary text-xs font-bold flex items-center gap-1 shadow-md transition-transform active:scale-95"
                    >
                      <Icon name={isPlayingAudio ? 'pause' : 'play_arrow'} className="text-sm" />
                      <span>{isPlayingAudio ? 'Pause' : 'Play'}</span>
                    </button>
                  )}
                </div>
              ) : catCode === 'DEALER' ? (
                /* Case 2: DEALER Multi-Pose Preview */
                <div className="w-full h-full flex flex-col items-center justify-between relative">
                  {/* Stage Switcher Pills */}
                  <div className="w-full flex items-center justify-center gap-1 p-1 bg-obsidian/60 rounded-xl border border-white/10 z-10">
                    {DEALER_POSES_SCHEMA.slice(0, 4).map(pose => (
                      <button
                        key={pose.key}
                        type="button"
                        onClick={() => {
                          setIsAutoAnimatingDealer(false)
                          setActiveDealerPreviewPose(pose.key)
                        }}
                        className={`flex-1 py-1 px-1 rounded-lg text-[11px] font-bold transition-all text-center truncate ${
                          activeDealerPreviewPose === pose.key
                            ? 'bg-tertiary text-on-tertiary shadow-sm'
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
                        <Icon name="face" className="text-4xl text-tertiary/40 mb-1" />
                        <span className="text-xs">No image for this pose yet</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom control: Auto Play Demo toggle & avatar badge */}
                  <div className="w-full flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAutoAnimatingDealer(!isAutoAnimatingDealer)}
                      className={`text-[11px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 border transition-colors ${
                        isAutoAnimatingDealer
                          ? 'bg-success/20 text-success border-success/40 '
                          : 'bg-white/10 text-white/70 border-white/10 hover:bg-white/20'
                      }`}
                    >
                      <Icon name={isAutoAnimatingDealer ? 'pause' : 'play_arrow'} className="text-xs" />
                      <span>{isAutoAnimatingDealer ? 'Previewing' : '▶ Preview 4 poses'}</span>
                    </button>

                    {dealerPoses.avatar?.previewUrl && (
                      <div
                        onClick={() => setActiveDealerPreviewPose('avatar')}
                        title="Show table avatar"
                        className="flex items-center gap-1.5 cursor-pointer bg-obsidian/60 px-2 py-0.5 rounded-full border border-tertiary/40"
                      >
                        <div className="w-5 h-5 rounded-full overflow-hidden border border-tertiary">
                          <img
                            src={dealerPoses.avatar.previewUrl}
                            alt="Avatar"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-[11px] font-bold text-tertiary-fixed">Avatar</span>
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
                    className="w-full h-full rounded-xl object-contain bg-obsidian"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-center p-3">
                    <div className="w-20 h-20 rounded-2xl bg-primary-container/20 border border-primary/40 flex items-center justify-center text-primary mb-2 shadow-lg">
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
                    <span className="text-xs font-bold text-primary">
                      {name || 'Win / all-in effect'}
                    </span>
                    <span className="text-[11px] text-white/40 mt-0.5">
                      {localVideoPreviewUrl ? 'Video ready' : 'No preview video'}
                    </span>
                  </div>
                )
              ) : (
                /* Case 4: Default CosmeticRenderer (CARD_SKIN, COIN_SKIN, TABLE, etc.) */
                <CosmeticRenderer
                  categoryCode={catCode}
                  previewUrl={
                    catCode === 'CARD_SKIN'
                      ? zipPreviewCards.frontUrl || null
                      : localAssetPreviewUrl || manualAssetUrl
                  }
                  assetUrl={
                    catCode === 'CARD_SKIN'
                      ? zipPreviewCards.backUrl || localAssetPreviewUrl || editingProduct?.previewUrl || null
                      : localAssetPreviewUrl || manualAssetUrl
                  }
                  isFlipped={catCode === 'CARD_SKIN' ? isCardPreviewFlipped : false}
                  onFlip={catCode === 'CARD_SKIN' ? setIsCardPreviewFlipped : null}
                  productName={name}
                  rank="A"
                  suit="S"
                  interactive
                />
              )}

              {catCode !== 'DEALER' && <span className="absolute bottom-2 left-2 text-[11px] font-bold px-2 py-0.5 rounded-full bg-obsidian/70 text-white/80 border border-white/10 z-10 backdrop-blur-sm">
                {currentCategory?.name || 'Item'}
              </span>}

              {catCode === 'CARD_SKIN' && (
                <button
                  type="button"
                  onClick={() => setIsCardPreviewFlipped(f => !f)}
                  className="absolute bottom-2 right-2 text-[11px] font-bold px-2.5 py-1 rounded-full bg-tertiary/20 hover:bg-tertiary/30 text-tertiary-fixed border border-tertiary/40 z-10 backdrop-blur-sm flex items-center gap-1 cursor-pointer transition-all"
                  title="Click to flip between front and back"
                >
                  <Icon name="3d_rotation" className="text-xs" />
                  <span>{isCardPreviewFlipped ? 'Front' : 'Back'}</span>
                </button>
              )}
            </div>

            {/* Product Meta Summary */}
            <div className="space-y-2 text-xs border-t border-white/10 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-white/50">Name:</span>
                <span className="font-bold text-white truncate max-w-[180px]">
                  {name || 'Untitled'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">Tier:</span>
                <span className="font-bold text-tertiary">{tier}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">VIP Coin price:</span>
                <span className="font-bold text-tertiary-fixed font-mono">
                  {formatVipCoin(priceVipCoin)} VIP
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/50">In VND:</span>
                <span className="font-bold text-white/80 font-mono">
                  {formatVnd(priceVnd)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-white/50">Status:</span>
                <button
                  type="button"
                  onClick={() => {
                    const next = !isExclusive
                    setIsExclusive(next)
                    if (next) setIsFlashSale(false)
                  }}
                  title="Click to switch between on sale and exclusive"
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all flex items-center gap-1 cursor-pointer ${
                    isExclusive
                      ? 'bg-error/20 text-error border-error/40 hover:bg-error/30'
                      : 'bg-success/20 text-success border-success/40 hover:bg-success/30'
                  }`}
                >
                  <Icon name={isExclusive ? 'lock' : 'check_circle'} className="text-xs" />
                  <span>{isExclusive ? 'Exclusive (click to put on sale)' : 'On sale (click to make exclusive)'}</span>
                </button>
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
                  ? submitStep || 'Working…'
                  : isEditing
                    ? 'Save changes'
                    : 'Save product'}
              </Button>
              <Button
                variant="secondary"
                size="md"
                disabled={isSubmitting}
                onClick={onCancel}
                className="w-full justify-center"
              >
                Cancel
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
