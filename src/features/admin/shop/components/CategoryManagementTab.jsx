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
      notify(err.message || 'Không thể tải danh sách danh mục', { type: 'error' })
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
    if (!window.confirm(`Bạn có chắc chắn muốn xóa danh mục "${cat.name}" (${cat.code})?`)) {
      return
    }
    setDeletingId(cat.id)
    try {
      await deleteCategory(cat.id)
      notify(`Đã xóa danh mục ${cat.name} thành công!`, { type: 'success' })
      loadCategories()
      onCategoryUpdated?.()
    } catch (err) {
      notify(err.message || 'Xóa danh mục thất bại', { type: 'error' })
    } finally {
      setDeletingId(null)
    }
  }

  const handleModalSuccess = () => {
    loadCategories()
    onCategoryUpdated?.()
  }

  const getCategoryIcon = code => {
    switch (code) {
      case 'DEALER':
        return 'face'
      case 'CARD_SKIN':
        return 'style'
      case 'TABLE':
        return 'crop_16_9'
      case 'FRAME':
        return 'account_circle'
      case 'ALL_IN_EFFECT':
      case 'VICTORY_EFFECT':
        return 'auto_awesome'
      case 'COIN_SKIN':
        return 'monetization_on'
      case 'EMOJI':
        return 'mood'
      case 'SOUND':
        return 'volume_up'
      default:
        return 'category'
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10 flex-wrap gap-4">
        <div>
          <h2 className="font-headline font-black text-xl text-white flex items-center gap-2">
            <Icon name="category" className="text-amber-400" />
            <span>Quản Lý Danh Mục Vật Phẩm (Shop Categories)</span>
          </h2>
          <p className="text-xs text-white/50">
            Quản lý các loại tài nguyên mỹ phẩm & skin cho Cửa Hàng và Túi Đồ của người chơi
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
            Làm Mới
          </Button>
          <Button
            variant="gold"
            size="sm"
            icon="add"
            onClick={handleOpenCreate}
          >
            + Thêm Danh Mục Mới
          </Button>
        </div>
      </div>

      {/* Categories Table / List */}
      <div className="rounded-3xl bg-[#140a28] border border-white/10 shadow-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-white/40 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
            <span className="text-xs">Đang tải danh mục...</span>
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-white/40 space-y-3">
            <Icon name="folder_off" className="text-4xl text-white/20 mx-auto" />
            <p className="text-sm">Chưa có danh mục nào trong hệ thống.</p>
            <Button variant="gold" size="sm" onClick={handleOpenCreate}>
              Tạo Danh Mục Đầu Tiên
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 bg-white/5 text-[11px] font-bold text-white/60 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Biểu Tượng</th>
                  <th className="py-3.5 px-6">Mã Danh Mục (Code)</th>
                  <th className="py-3.5 px-6">Tên Hiển Thị</th>
                  <th className="py-3.5 px-6">Loại Định Danh</th>
                  <th className="py-3.5 px-6 text-right">Thao Tác</th>
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
                      <td className="py-4 px-6">
                        <span className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center">
                          <Icon name={getCategoryIcon(cat.code)} className="text-lg" />
                        </span>
                      </td>
                      <td className="py-4 px-6 font-mono font-bold text-amber-300">
                        {cat.code}
                      </td>
                      <td className="py-4 px-6 font-bold text-white text-sm">
                        {cat.name}
                      </td>
                      <td className="py-4 px-6">
                        {isCore ? (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
                            Cốt Lõi AI & 3D
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-white/60 border border-white/10">
                            Vật Phẩm Thường
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(cat)}
                            title="Chỉnh sửa tên danh mục"
                            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-white/70 hover:text-white transition-all"
                          >
                            <Icon name="edit" className="text-base" />
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === cat.id}
                            onClick={() => handleDelete(cat)}
                            title="Xóa danh mục"
                            className="p-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 transition-all disabled:opacity-40"
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
