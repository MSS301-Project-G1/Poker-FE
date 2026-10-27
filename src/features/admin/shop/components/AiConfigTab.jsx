import { useState, useEffect } from 'react'
import { Icon, Button, useToast } from '@/shared/ui'
import {
  getAiModels,
  setDefaultAiModel,
  toggleAiModelActive,
  syncAiModels,
} from '../services/adminShopService'

export default function AiConfigTab() {
  const notify = useToast()
  const [models, setModels] = useState([])
  const [loading, setLoading] = useState(false)
  const [syncing, setSyncing] = useState(false)

  const loadModels = async () => {
    setLoading(true)
    try {
      const res = await getAiModels()
      setModels(res?.data || [])
    } catch (err) {
      notify(err.message || 'Không thể tải danh sách cấu hình AI Model', { type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadModels()
  }, [])

  const handleSetDefault = async id => {
    try {
      await setDefaultAiModel(id)
      notify('Đã đặt làm mô hình AI mặc định thành công!', { type: 'success' })
      loadModels()
    } catch (err) {
      notify(err.message || 'Thao tác thất bại', { type: 'error' })
    }
  }

  const handleToggleActive = async (id, currentActive) => {
    try {
      await toggleAiModelActive(id, !currentActive)
      notify(`Đã ${!currentActive ? 'kích hoạt' : 'tắt'} mô hình thành công!`, { type: 'success' })
      loadModels()
    } catch (err) {
      notify(err.message || 'Thao tác thất bại', { type: 'error' })
    }
  }

  const handleSync = async provider => {
    setSyncing(true)
    try {
      await syncAiModels(provider)
      notify(`Đồng bộ danh sách mô hình từ ${provider} thành công!`, { type: 'success' })
      loadModels()
    } catch (err) {
      notify(err.message || 'Đồng bộ thất bại', { type: 'error' })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-[#1d0b38] via-[#140827] to-[#0d041a] border border-purple-500/30 shadow-2xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-80 bg-gradient-to-l from-purple-500/10 to-transparent pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-purple-500 text-white shadow-sm">
              AI ENGINE CORE
            </span>
            <span className="text-xs text-white/50">• Điều Phối Đa Mô Hình & Sinh Đồ Họa</span>
          </div>
          <h2 className="font-headline font-black text-2xl text-white flex items-center gap-3">
            <Icon name="psychology" className="text-purple-400 text-3xl" />
            <span>Quản Trị Nhà Cung Cấp & Mô Hình AI</span>
          </h2>
          <p className="text-xs text-white/60 mt-1 max-w-xl">
            Tự do chuyển đổi giữa Google Gemini (1.5 Pro, Flash, Imagen 3) và OpenAI GPT-4o. Frontend tự động truy vấn danh sách khả dụng từ Backend, không gán cứng tên model.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 flex-wrap">
          <Button
            variant="gold"
            size="md"
            icon="sync"
            loading={syncing}
            onClick={() => handleSync('GEMINI')}
          >
            Đồng Bộ Gemini
          </Button>

          <Button
            variant="secondary"
            size="md"
            icon="cloud_sync"
            loading={syncing}
            onClick={() => handleSync('OPENAI')}
          >
            Đồng Bộ OpenAI
          </Button>
        </div>
      </div>

      {/* Model Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-12 text-center text-white/50">
            <span className="w-8 h-8 border-3 border-purple-400 border-t-transparent rounded-full animate-spin inline-block mr-3" />
            Đang tải danh sách AI Model...
          </div>
        ) : models.length === 0 ? (
          <div className="col-span-full p-12 text-center text-white/40">
            <Icon name="smart_toy" className="text-4xl text-white/20 mb-2 block mx-auto" />
            Chưa có mô hình AI nào được cấu hình.
          </div>
        ) : (
          models.map(m => (
            <div
              key={m.id}
              className={`p-5 rounded-3xl border transition-all flex flex-col justify-between ${
                m.isDefault
                  ? 'bg-[#1b0a33] border-amber-400/80 shadow-lg shadow-amber-500/10 ring-2 ring-amber-400/30'
                  : m.isActive
                  ? 'bg-[#130824]/90 border-white/10 hover:border-white/20'
                  : 'bg-[#0e0419]/70 border-white/5 opacity-60'
              }`}
            >
              <div>
                {/* Header: Provider & Default badge */}
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      m.provider === 'GEMINI'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    }`}
                  >
                    {m.provider}
                  </span>

                  {m.isDefault && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400 text-slate-950 flex items-center gap-1 shadow-sm">
                      <Icon name="star" className="text-xs" /> Mặc Định
                    </span>
                  )}
                </div>

                {/* Display Name & Model Identifier */}
                <h3 className="font-headline font-black text-base text-white mb-1">
                  {m.displayName}
                </h3>
                <span className="font-mono text-xs text-amber-300/80 block mb-3">
                  {m.modelName}
                </span>

                {/* Capabilities pills */}
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {m.capabilities?.map((c, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded-lg bg-white/5 border border-white/10 text-[10px] font-semibold text-white/70"
                    >
                      {c === 'STYLE_SPEC_GENERATION'
                        ? 'Tạo Style Spec'
                        : c === 'DEALER_POSE_GENERATION'
                        ? 'Dealer 4 Tư Thế'
                        : c === 'PROMPT_REFINEMENT'
                        ? 'Phản Hồi Refine'
                        : c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleToggleActive(m.id, m.isActive)}
                  className={`text-xs font-bold px-3 py-1.5 rounded-xl border transition-all ${
                    m.isActive
                      ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30'
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {m.isActive ? 'Tắt Kích Hoạt' : 'Bật Sử Dụng'}
                </button>

                {!m.isDefault && m.isActive && (
                  <button
                    type="button"
                    onClick={() => handleSetDefault(m.id)}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-400/40 transition-all flex items-center gap-1"
                  >
                    <Icon name="star" className="text-sm" />
                    <span>Đặt Mặc Định</span>
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
