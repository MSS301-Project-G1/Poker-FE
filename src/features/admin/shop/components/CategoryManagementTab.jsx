import { useState, useEffect } from 'react'
import { Icon, Button, useToast } from '@/shared/ui'
import { getCategories, deleteCategory } from '../services/adminShopService'
import AddCategoryModal from './AddCategoryModal'

export default function CategoryManagementTab({ onCategoryUpdated }) {
  const notify = useToast()
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState(null)
  const [deletingId, setDeletingId] = useState(null)

  const loadCategories = async () => {
    setLoading(true)
    try {
      const res = await getCategories()
      setCategories(res?.data || [])
    } catch (err) {
      notify(err.message || 'Couldn’t load categories', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const handleOpenCreate = () => {
    setEditingCategory(null)
    setModalOpen(true)
  }

  const handleOpenEdit = cat => {
    setEditingCategory(cat)
    setModalOpen(true)
  }

  const handleDelete = async cat => {
    if (!window.confirm(`Delete the category “${cat.name}” (${cat.code})?`)) {
      return
    }
    setDeletingId(cat.id)
    try {
      await deleteCategory(cat.id)
      notify(`Deleted ${cat.name}.`, { type: 'success' })
      loadCategories()
      onCategoryUpdated?.()
    } catch (err) {
      notify(err.message || 'Couldn’t delete the category', { type: 'error' })
    } finally {
      setDeletingId(null)
    }
  }

  const handleModalSuccess = () => {
    loadCategories()
    onCategoryUpdated?.()
  }


  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-wrap gap-4">
        <div>
          <h2 className="font-headline font-bold text-xl text-white flex items-center gap-2">
            <Icon name="category" className="text-tertiary" />
            <span>Shop categories</span>
          </h2>
          <p className="text-xs text-white/50">
            Cosmetic and skin types for the shop and player inventories
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            icon="refresh"
            loading={loading}
            onClick={loadCategories}
          >
            Refresh
          </Button>
          <Button
            variant="gold"
            size="sm"
            icon="add"
            onClick={handleOpenCreate}
          >
            + New category
          </Button>
        </div>
      </div>

      {/* Categories Table / List */}
      <div className="rounded-2xl bg-surface-container-lowest border border-white/10 shadow-raised overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-white/40 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-tertiary border-t-transparent animate-spin" />
            <span className="text-xs">Loading categories…</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-white/40 space-y-3">
            <Icon name="folder_off" className="text-4xl text-white/20 mx-auto" />
            <p className="text-sm">No categories yet.</p>
            <Button variant="gold" size="sm" onClick={handleOpenCreate}>
              Create the first category
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-[11px] font-bold text-white/60">
                  <th className="py-3.5 px-6">Code</th>
                  <th className="py-3.5 px-6">Display name</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs text-white/90">
                {categories.map(cat => {
                  const isCore = ['DEALER', 'CARD_SKIN', 'TABLE'].includes(cat.code)
                  return (
                    <tr
                      key={cat.id || cat.code}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      <td className="py-4 px-6 font-mono font-bold text-tertiary-fixed">
                        {cat.code}
                      </td>
                      <td className="py-4 px-6 font-bold text-white text-sm">
                        {cat.name}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(cat)}
                            title="Rename category"
                            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-all"
                          >
                            <Icon name="edit" className="text-base" />
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === cat.id}
                            onClick={() => handleDelete(cat)}
                            title="Delete category"
                            className="p-1.5 rounded-xl bg-error/10 hover:bg-error/20 text-error hover:text-error transition-all disabled:opacity-40"
                          >
                            <Icon name="delete" className="text-base" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      <AddCategoryModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleModalSuccess}
        categoryToEdit={editingCategory}
      />
    </div>
  )
}
