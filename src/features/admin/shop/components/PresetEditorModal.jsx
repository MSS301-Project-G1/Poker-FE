import { useState, useEffect, useMemo } from 'react'
import { Icon, Button, useToast } from '@/shared/ui'
import { createPromptPreset, updatePromptPreset, deletePromptPreset } from '../services/adminShopService'

// Visual Theme Presets
const THEME_OPTIONS = [
  { id: 'ROYAL_GOLD', label: 'Hoàng Gia Vàng Kim', icon: 'military_tech', desc: 'Vàng 24K ánh kim cao cấp' },
  { id: 'CYBERPUNK', label: 'Cyberpunk Neon', icon: 'bolt', desc: 'Đèn LED xanh tím tương lai' },
  { id: 'OBSIDIAN_BLACK', label: 'Hắc Kim Huyền Bí', icon: 'dark_mode', desc: 'Đen nhám viền vàng sang trọng' },
  { id: 'FROSTED_CRYSTAL', label: 'Băng Tuyết & Pha Lê', icon: 'ac_unit', desc: 'Tinh thể trong suốt lấp lánh' },
  { id: 'CLASSIC_CASINO', label: 'Sòng Bạc Cổ Điển', icon: 'casino', desc: 'Chuẩn sòng bạc Las Vegas' },
  { id: 'MINIMAL_LUXURY', label: 'Tối Giản Tinh Tế', icon: 'diamond', desc: 'Đường nét hiện đại thanh lịch' },
]

// Material & Finish Options
const FINISH_OPTIONS = [
  { id: 'METALLIC_GLOSS', label: 'Bóng Kim Loại (Gloss)', icon: 'auto_awesome' },
  { id: 'MATTE_SMOOTH', label: 'Sơn Mờ / Nhám (Matte)', icon: 'texture' },
  { id: 'NEON_GLOW', label: 'Phát Sáng Dạ Quang (Neon)', icon: 'lightbulb' },
  { id: 'DIAMOND_SPARKLE', label: 'Ánh Kim Cương (Sparkle)', icon: 'diamond' },
]

// Quick Color Swatches
const COLOR_SWATCHES = [
  { name: 'Vàng Kim 24K', hex: '#FFD700' },
  { name: 'Đỏ Ruby', hex: '#DC143C' },
  { name: 'Xanh Neon', hex: '#00E5FF' },
  { name: 'Tím Hoàng Gia', hex: '#8A2BE2' },
  { name: 'Xanh Lục Bảo', hex: '#00C853' },
  { name: 'Hồng Nơ', hex: '#FF80BF' },
  { name: 'Đen Hắc Kim', hex: '#141414' },
  { name: 'Trắng Bạch Kim', hex: '#F0F0F0' },
]

export default function PresetEditorModal({
  isOpen,
  onClose,
  preset = null,
  categoryCode = 'CARD_SKIN',
  onSaveSuccess,
}) {
  const notify = useToast()
  const isEditing = Boolean(preset?.id)

  const [presetName, setPresetName] = useState('')
  const [description, setDescription] = useState('')

  // Visual Style Controls
  const [selectedTheme, setSelectedTheme] = useState('ROYAL_GOLD')
  const [primaryColor, setPrimaryColor] = useState('#FFD700')
  const [secondaryColor, setSecondaryColor] = useState('#1A0933')
  const [accentColor, setAccentColor] = useState('#00E5FF')
  const [selectedFinish, setSelectedFinish] = useState('METALLIC_GLOSS')

  // Advanced Raw JSON toggle (hidden by default)
  const [showAdvancedJson, setShowAdvancedJson] = useState(false)
  const [customJsonOverride, setCustomJsonOverride] = useState('')

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  // Parse existing preset on open
  useEffect(() => {
    if (!isOpen) return
    if (preset) {
      setPresetName(preset.presetName || '')
      setDescription(preset.description || '')

      let guide = {}
      if (typeof preset.styleGuideJson === 'object' && preset.styleGuideJson !== null) {
        guide = preset.styleGuideJson
      } else if (typeof preset.styleGuideJson === 'string') {
        try {
          guide = JSON.parse(preset.styleGuideJson)
        } catch {
          guide = {}
        }
      }

      if (guide.theme) setSelectedTheme(guide.theme)
      if (guide.palette?.primary) setPrimaryColor(guide.palette.primary)
      if (guide.palette?.secondary) setSecondaryColor(guide.palette.secondary)
      if (guide.palette?.accent) setAccentColor(guide.palette.accent)
      if (guide.finish) setSelectedFinish(guide.finish)

      setCustomJsonOverride(JSON.stringify(guide, null, 2))
    } else {
      setPresetName('')
      setDescription('')
      setSelectedTheme('ROYAL_GOLD')
      setPrimaryColor('#FFD700')
      setSecondaryColor('#1A0933')
      setAccentColor('#00E5FF')
      setSelectedFinish('METALLIC_GLOSS')
      setShowAdvancedJson(false)
      setCustomJsonOverride('')
    }
  }, [isOpen, preset])

  // Computed JSON from visual controls
  const computedStyleGuideJson = useMemo(() => {
    if (showAdvancedJson && customJsonOverride.trim()) {
      return customJsonOverride.trim()
    }
    const guide = {
      theme: selectedTheme,
      palette: {
        primary: primaryColor,
        secondary: secondaryColor,
        accent: accentColor,
      },
      finish: selectedFinish,
    }
    return JSON.stringify(guide, null, 2)
  }, [selectedTheme, primaryColor, secondaryColor, accentColor, selectedFinish, showAdvancedJson, customJsonOverride])

  if (!isOpen) return null

  const handleSave = async () => {
    if (!presetName.trim()) {
      notify('Vui lòng nhập tên Mẫu Phong Cách (Preset Name)', { type: 'error' })
      return
    }

    try {
      JSON.parse(computedStyleGuideJson)
    } catch (err) {
      notify('Cấu trúc JSON chưa hợp lệ: ' + err.message, { type: 'error' })
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        presetName: presetName.trim(),
        categoryCode: categoryCode.toUpperCase(),
        description: description.trim(),
        styleGuideJson: computedStyleGuideJson,
        isActive: true,
      }

      let res
      if (isEditing) {
        res = await updatePromptPreset(preset.id, payload)
        notify(`Cập nhật Preset "${presetName}" thành công!`, { type: 'success' })
      } else {
        res = await createPromptPreset(payload)
        notify(`Tạo mới Preset "${presetName}" thành công!`, { type: 'success' })
      }

      onSaveSuccess?.(res?.data)
      onClose()
    } catch (err) {
      notify(err.message || 'Lưu mẫu phong cách thất bại', { type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!preset?.id) return
    if (!window.confirm(`Bạn có chắc muốn xóa vĩnh viễn Preset "${preset.presetName}"?`)) return

    setIsDeleting(true)
    try {
      await deletePromptPreset(preset.id)
      notify(`Đã xóa Preset "${preset.presetName}" thành công!`, { type: 'success' })
      onSaveSuccess?.(null)
      onClose()
    } catch (err) {
      notify(err.message || 'Xóa preset thất bại', { type: 'error' })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in font-body-md text-white">
      <div className="w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl bg-[#170a2c] border border-amber-400/30 p-6 shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center font-bold">
              <Icon name="palette" className="text-xl" />
            </span>
            <div>
              <h3 className="font-headline font-black text-lg text-white">
                {isEditing ? 'Chỉnh Sửa Mẫu Phong Cách (Preset)' : 'Tạo Mẫu Phong Cách Mới (Preset)'}
              </h3>
              <p className="text-[11px] text-white/50">
                Danh mục: <span className="text-amber-400 font-bold uppercase">{categoryCode}</span> • Chọn chủ đề & bảng màu trực quan bằng nút bấm
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <Icon name="close" className="text-base" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="space-y-4 text-xs">
          {/* Preset Name */}
          <div>
            <label className="text-xs font-bold text-white/80 block mb-1.5">
              Tên Mẫu Phong Cách <span className="text-rose-400">*</span>:
            </label>
            <input
              type="text"
              value={presetName}
              onChange={e => setPresetName(e.target.value)}
              placeholder="Ví dụ: Hoàng Gia Hắc Kim, Cyber Neon 2077..."
              className="w-full px-4 py-2.5 rounded-2xl bg-black/50 border border-white/15 text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold text-white/80 block mb-1.5">
              Mô tả ngắn về phong cách:
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Mô tả phong cách chủ đạo, tông màu hoặc đường nét thiết kế..."
              className="w-full px-4 py-2 rounded-2xl bg-black/50 border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Theme Selector (Buttons Grid) */}
          <div>
            <label className="text-xs font-bold text-white/80 block mb-1.5">
              1. Chọn Chủ Đề Phong Cách (Theme):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {THEME_OPTIONS.map(opt => {
                const isSelected = selectedTheme === opt.id
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setSelectedTheme(opt.id)}
                    className={`p-3 rounded-2xl border text-left transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow-md ring-1 ring-amber-400/40'
                        : 'bg-black/40 border-white/10 text-white/70 hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <Icon name={opt.icon} className={`text-lg shrink-0 mt-0.5 ${isSelected ? 'text-amber-400' : 'text-white/40'}`} />
                    <div className="min-w-0">
                      <span className="font-bold text-xs block text-white truncate">{opt.label}</span>
                      <span className="text-[10px] text-white/40 block mt-0.5 truncate">{opt.desc}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Color Palette (Buttons & Swatches) */}
          <div className="p-4 rounded-2xl bg-black/40 border border-white/10 space-y-3">
            <label className="text-xs font-bold text-white/90 block">
              2. Bảng Màu Chủ Đạo (Bấm Chọn Trực Quan):
            </label>

            {/* Quick Palette Swatches Bar */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-white/50">Màu gợi ý nhanh:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                {COLOR_SWATCHES.map(sw => (
                  <button
                    key={sw.hex}
                    type="button"
                    onClick={() => setPrimaryColor(sw.hex)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-white/5 hover:bg-white/10 border border-white/15 transition-all text-[11px]"
                  >
                    <span className="w-3.5 h-3.5 rounded-full border border-white/20 shrink-0" style={{ backgroundColor: sw.hex }} />
                    <span className="text-white/80 font-medium">{sw.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Color Pickers Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {/* Primary */}
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-white/70 block">Màu Chính</span>
                  <span className="text-[10px] text-white/40 font-mono">{primaryColor}</span>
                </div>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={e => setPrimaryColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  title="Chọn màu chính"
                />
              </div>

              {/* Secondary */}
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-white/70 block">Màu Nền</span>
                  <span className="text-[10px] text-white/40 font-mono">{secondaryColor}</span>
                </div>
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={e => setSecondaryColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  title="Chọn màu nền"
                />
              </div>

              {/* Accent */}
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-white/70 block">Màu Điểm Nhấn</span>
                  <span className="text-[10px] text-white/40 font-mono">{accentColor}</span>
                </div>
                <input
                  type="color"
                  value={accentColor}
                  onChange={e => setAccentColor(e.target.value)}
                  className="w-8 h-8 rounded-lg cursor-pointer bg-transparent border-0"
                  title="Chọn màu điểm nhấn"
                />
              </div>
            </div>
          </div>

          {/* Material & Finish */}
          <div>
            <label className="text-xs font-bold text-white/80 block mb-1.5">
              3. Chất Liệu Bề Mặt & Hiệu Ứng (Finish):
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {FINISH_OPTIONS.map(f => {
                const isSelected = selectedFinish === f.id
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedFinish(f.id)}
                    className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? 'bg-amber-400 text-slate-950 font-bold border-amber-400 shadow-md'
                        : 'bg-black/30 border-white/10 text-white/70 hover:border-white/20'
                    }`}
                  >
                    <Icon name={f.icon} className="text-base" />
                    <span className="text-[11px] font-bold leading-tight">{f.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Collapsible Technical JSON (Hidden by default for non-coders) */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setShowAdvancedJson(!showAdvancedJson)}
              className="text-[11px] text-white/40 hover:text-white/70 flex items-center gap-1 transition-colors"
            >
              <Icon name={showAdvancedJson ? 'expand_less' : 'code'} className="text-sm" />
              <span>{showAdvancedJson ? 'Ẩn cấu trúc JSON kỹ thuật' : '👁️ Xem cấu trúc JSON (Dành cho nhà phát triển)'}</span>
            </button>

            {showAdvancedJson && (
              <textarea
                rows={4}
                value={customJsonOverride || computedStyleGuideJson}
                onChange={e => setCustomJsonOverride(e.target.value)}
                className="w-full mt-2 px-3 py-2 rounded-xl bg-black/60 border border-purple-500/30 text-[11px] font-mono text-purple-200 focus:outline-none focus:border-amber-400"
              />
            )}
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
          {isEditing ? (
            <button
              type="button"
              disabled={isSubmitting || isDeleting}
              onClick={handleDelete}
              className="px-3.5 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
            >
              <Icon name="delete" className="text-sm" />
              <span>Xóa Preset Này</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <Button variant="secondary" size="md" onClick={onClose} disabled={isSubmitting || isDeleting}>
              Hủy
            </Button>
            <Button variant="gold" size="md" icon="save" loading={isSubmitting} onClick={handleSave}>
              {isEditing ? 'Lưu Thay Đổi' : 'Tạo Preset Ngay'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
