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
      notify('Enter a category code', { type: 'error' })
      return
    }
    if (!/^[A-Z0-9_]+$/.test(cleanCode)) {
      notify('Category codes use uppercase letters, digits and underscores (e.g. DEALER, CARD_SKIN)', { type: 'error' })
      return
    }
    if (!cleanName) {
      notify('Enter a category name', { type: 'error' })
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
        notify('Category updated.', { type: 'success' })
        onSuccess?.(res?.data || { ...categoryToEdit, name: cleanName })
      } else {
        const res = await createCategory({
          code: cleanCode,
          name: cleanName,
        })
        notify('Category created.', { type: 'success' })
        onSuccess?.(res?.data || { code: cleanCode, name: cleanName })
      }
      onClose()
    } catch (err) {
      notify(err.message || 'Action failed', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-surface-container-lowest border border-tertiary/40 shadow-raised p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-tertiary text-on-tertiary flex items-center justify-center font-bold shadow-md">
              <Icon name="category" className="text-xl" />
            </span>
            <div>
              <h3 className="font-headline font-bold text-base text-white">
                {isEditing ? 'Edit category' : 'New category'}
              </h3>
              <p className="text-[11px] text-white/50">Groups products in the shop and inventories</p>
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
              Category code: <span className="text-tertiary">*</span>
            </label>
            <input
              type="text"
              disabled={isEditing}
              placeholder="VD: DEALER, CARD_SKIN, TABLE, EMOJI..."
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              className={`w-full px-4 py-2.5 rounded-2xl bg-obsidian/50 border border-white/15 text-sm font-mono text-white placeholder-white/30 focus:outline-none focus:border-tertiary ${
                isEditing ? 'opacity-60 cursor-not-allowed' : ''
              }`}
            />
            <span className="text-[11px] text-white/40 mt-1 block">
              A–Z, 0–9 and underscores only. Must be unique.
            </span>
          </div>

          <div>
            <label className="text-xs font-bold text-white/80 block mb-1">
              Display name: <span className="text-tertiary">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Dealer, Card skin, Poker table"
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-2xl bg-obsidian/50 border border-white/15 text-sm text-white placeholder-white/30 focus:outline-none focus:border-tertiary"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-white/80 block mb-1.5">
              Asset types this category accepts:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'hasImage', label: 'Texture / icon image', icon: 'image' },
                { key: 'hasVideo', label: 'Video Review (MP4)', icon: 'videocam' },
                { key: 'hasSound', label: 'Sound (MP3)', icon: 'volume_up' },
                { key: 'hasPoses', label: 'Poses', icon: 'accessibility_new' },
                { key: 'hasDeckZip', label: '52-card deck (ZIP)', icon: 'style' },
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
                        ? 'bg-tertiary/20 text-tertiary-fixed border-tertiary'
                        : 'bg-obsidian/40 text-white/40 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      <Icon name={item.icon} className="text-sm" />
                      <span>{item.label}</span>
                    </span>
                    <span
                      className={`text-[11px] px-1 py-0.2 rounded font-bold ${
                        active ? 'bg-tertiary text-on-tertiary' : 'bg-white/10 text-white/40'
                      }`}
                    >
                      {active ? 'ON' : 'OFF'}
                    </span>
                  </button>
                )
              })}
            </div>
            <span className="text-[11px] text-white/40 mt-1 block">
              You can still adjust this for each product.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-white/10">
            <Button variant="secondary" size="md" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button variant="gold" size="md" loading={loading} type="submit" icon="check">
              {isEditing ? 'Save changes' : 'Create category'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
