import { useState } from 'react'
import { Icon, Button, useToast } from '@/shared/ui'
import { createCategory, updateCategory } from '../services/adminShopService'

export default function AddCategoryModal({
  isOpen,
  onClose,
  onSuccess,
  categoryToEdit = null,
}) {
  const notify = useToast()
  const isEditing = Boolean(categoryToEdit)

  const [code, setCode] = useState(categoryToEdit?.code || '')
  const [name, setName] = useState(categoryToEdit?.name || '')
  const [loading, setLoading] = useState(false)

  const [catConfig, setCatConfig] = useState(() => {
    if (categoryToEdit?.code) {
      try {
        const saved = localStorage.getItem(`cat_asset_config_${categoryToEdit.code}`)
        if (saved) return JSON.parse(saved)
      } catch {}
    }
    return {
      hasImage: true,
      hasVideo: true,
      hasSound: false,
      hasPoses: false,
      hasDeckZip: false,
    }
  })

  if (!isOpen) return null

  const handleSubmit = async e => {
    e.preventDefault()
    const cleanCode = code.trim().toUpperCase()
    const cleanName = name.trim()

    if (!cleanCode) {
      notify('Vui lòng nhập mã danh mục', { type: 'error' })
      return
    }
    if (!/^[A-Z0-9_]+$/.test(cleanCode)) {
      notify('Mã danh mục chỉ gồm chữ hoa, số và dấu gạch dưới (VD: DEALER, CARD_SKIN)', { type: 'error' })
      return
    }
    if (!cleanName) {
      notify('Vui lòng nhập tên danh mục', { type: 'error' })
      return
    }

    setLoading(true)
    try {
      try {
        localStorage.setItem(`cat_asset_config_${cleanCode}`, JSON.stringify(catConfig))
      } catch {}

      if (isEditing) {
        const res = await updateCategory(categoryToEdit.id, {
          name: cleanName,
        })
        notify('Cập nhật danh mục thành công!', { type: 'success' })
        onSuccess?.(res?.data || { ...categoryToEdit, name: cleanName })
      } else {
        const res = await createCategory({
          code: cleanCode,
          name: cleanName,
        })
        notify('Tạo danh mục mới thành công!', { type: 'success' })
        onSuccess?.(res?.data || { code: cleanCode, name: cleanName })
      }
      onClose()
    } catch (err) {
      notify(err.message || 'Thao tác thất bại', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-[#140a28] border border-amber-500/40 shadow-2xl p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Icon name="category" className="text-xl" />
            </span>
            <div>
              <h3 className="font-headline font-black text-base text-white">
                {isEditing ? 'Chỉnh Sửa Danh Mục' : 'Tạo Danh Mục Vật Phẩm Mới'}
              </h3>
              <p className="text-[11px] text-white/50">Phân loại sản phẩm trong Cửa Hàng & Túi Đồ</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all"
          >
            <Icon name="close" className="text-base" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-white/80 block mb-1">
              Mã danh mục (CODE): <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              disabled={isEditing}
              placeholder="VD: DEALER, CARD_SKIN, TABLE, EMOJI..."
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              className={`w-full px-4 py-2.5 rounded-2xl bg-black/50 border border-white/15 text-sm font-mono text-white placeholder-white/30 focus:outline-none focus:border-amber-400 ${
                isEditing ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            />
            <span className="text-[10px] text-white/40 mt-1 block">
              Chỉ cho phép ký tự A-Z, 0-9 và gạch dưới. Định danh duy nhất trong hệ thống.
            </span>
          </div>

          <div>
            <label className="text-xs font-bold text-white/80 block mb-1">
              Tên hiển thị danh mục: <span className="text-amber-400">*</span>
            </label>
            <input
              type="text"
              placeholder="VD: Người chia bài, Skin bộ bài, Bàn chơi poker..."
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-black/50 border border-white/15 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-400"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-white/80 block mb-1.5">
              Định dạng tệp tài nguyên danh mục tiếp nhận:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'hasImage', label: 'Ảnh Texture / Icon', icon: 'image' },
                { key: 'hasVideo', label: 'Video Review (MP4)', icon: 'videocam' },
                { key: 'hasSound', label: 'Âm Thanh (MP3)', icon: 'volume_up' },
                { key: 'hasPoses', label: 'Đa Tư Thế (Poses)', icon: 'accessibility_new' },
                { key: 'hasDeckZip', label: 'Bộ Bài 52 Lá (ZIP)', icon: 'style' },
              ].map(item => {
                const active = Boolean(catConfig[item.key])
                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() =>
                      setCatConfig(prev => ({
                        ...prev,
                        [item.key]: !prev[item.key],
                      }))
                    }
                    className={`p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between border ${
                      active
                        ? 'bg-amber-400/20 text-amber-300 border-amber-400'
                        : 'bg-black/40 text-white/40 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Icon name={item.icon} className="text-sm" />
                      <span>{item.label}</span>
                    </span>
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded font-black ${
                        active ? 'bg-amber-400 text-slate-950' : 'bg-white/10 text-white/40'
                      }`}
                    >
                      {active ? 'BẬT' : 'TẮT'}
                    </span>
                  </button>
                )
              })}
            </div>
            <span className="text-[10px] text-white/40 mt-1 block">
              Admin có thể tùy chỉnh lại linh hoạt khi thêm từng sản phẩm cụ thể.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
            <Button variant="secondary" size="md" onClick={onClose} type="button">
              Hủy Bỏ
            </Button>
            <Button variant="gold" size="md" loading={loading} type="submit" icon="check">
              {isEditing ? 'Lưu Thay Đổi' : 'Tạo Danh Mục'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
