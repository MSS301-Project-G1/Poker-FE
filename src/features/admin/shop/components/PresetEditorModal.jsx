import { useState, useEffect } from 'react'
import { Icon, Button, useToast } from '@/shared/ui'
import { createPromptPreset, updatePromptPreset, deletePromptPreset } from '../services/adminShopService'

export default function PresetEditorModal({
  isOpen,
  onClose,
  preset = null,
  categoryCode = 'DEALER',
  onSaveSuccess,
}) {
  const notify = useToast()
  const isEditing = Boolean(preset?.id)

  const [presetName, setPresetName] = useState('')
  const [description, setDescription] = useState('')
  const [styleGuideJson, setStyleGuideJson] = useState('{}')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    if (preset) {
      setPresetName(preset.presetName || '')
      setDescription(preset.description || '')
      setStyleGuideJson(
        typeof preset.styleGuideJson === 'object'
          ? JSON.stringify(preset.styleGuideJson, null, 2)
          : preset.styleGuideJson || '{}'
      )
    } else {
      setPresetName('')
      setDescription('')
      setStyleGuideJson('{\n  "theme": "CUSTOM",\n  "palette": {\n    "primary": "#E2B842",\n    "secondary": "#1A0933"\n  }\n}')
    }
  }, [isOpen, preset])

  if (!isOpen) return null

  const handleSave = async () => {
    if (!presetName.trim()) {
      notify('Vui lòng nhập tên Mẫu Phong Cách (Preset Name)', { type: 'error' })
      return
    }

    // Validate JSON format if provided
    let cleanJson = styleGuideJson.trim() || '{}'
    try {
      JSON.parse(cleanJson)
    } catch (err) {
      notify('Cấu trúc Style Guide JSON chưa hợp lệ: ' + err.message, { type: 'error' })
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        presetName: presetName.trim(),
        categoryCode: categoryCode.toUpperCase(),
        description: description.trim(),
        styleGuideJson: cleanJson,
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
      <div className="w-full max-w-xl rounded-3xl bg-[#170a2c] border border-purple-500/30 p-6 shadow-2xl space-y-5">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center font-bold">
              <Icon name="palette" className="text-xl" />
            </span>
            <div>
              <h3 className="font-headline font-black text-lg text-white">
                {isEditing ? 'Tinh Chỉnh Mẫu Phong Cách (Preset)' : 'Thêm Mẫu Phong Cách Mới Cho AI'}
              </h3>
              <p className="text-[11px] text-white/50">
                Danh mục: <span className="text-amber-400 font-bold uppercase">{categoryCode}</span> • Thiết lập hướng dẫn thẩm mỹ cho AI
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
        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-white/80 block mb-1.5">
              Tên Mẫu Phong Cách (Preset Name) <span className="text-rose-400">*</span>:
            </label>
            <input
              type="text"
              value={presetName}
              onChange={e => setPresetName(e.target.value)}
              placeholder="Ví dụ: Croupier Quý Phái Monaco, Bàn Cyber Neon 2077..."
              className="w-full px-4 py-2.5 rounded-2xl bg-black/50 border border-white/15 text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-white/80 block mb-1.5">
              Mô tả chi tiết phong cách & bối cảnh:
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Mô tả các đặc trưng như trang phục, ánh sáng, góc máy, chất liệu hoặc tông màu chủ đạo..."
              className="w-full px-4 py-2.5 rounded-2xl bg-black/50 border border-white/15 text-xs text-white placeholder-white/30 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-white/80">
                Cấu hình Style Guide JSON (Bộ quy chuẩn cho AI):
              </label>
              <span className="text-[10px] text-white/40 font-mono">Định dạng JSON chuẩn</span>
            </div>
            <textarea
              rows={5}
              value={styleGuideJson}
              onChange={e => setStyleGuideJson(e.target.value)}
              placeholder='{\n  "theme": "ROYAL_GOLD",\n  "materials": "24K_GOLD"\n}'
              className="w-full px-4 py-2.5 rounded-2xl bg-black/60 border border-purple-500/30 text-xs font-mono text-purple-200 placeholder-white/30 focus:outline-none focus:border-purple-400"
            />
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
