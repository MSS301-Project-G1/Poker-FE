import { Icon, Button } from '@/shared/ui'

export default function PromptPreviewModal({ promptText, isOpen, onClose }) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-2xl bg-[#150a26] border border-amber-400/40 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2 text-amber-300 font-headline font-bold text-base">
            <Icon name="visibility" className="text-xl" />
            <span>Cấu Trúc Prompt Hệ Thống Gửi Cho AI</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white"
          >
            <Icon name="close" className="text-lg" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto bg-black/60 p-4 rounded-2xl border border-white/10 font-mono text-xs text-amber-200/90 whitespace-pre-wrap leading-relaxed">
          {promptText || 'Đang tải cấu trúc prompt...'}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-white/10 shrink-0">
          <span className="text-[11px] text-white/50">
            Prompt được chuẩn hóa để ngăn chặn rủi ro Prompt Injection và sinh đúng schema JSON.
          </span>
          <Button variant="secondary" size="sm" onClick={onClose}>
            Đóng
          </Button>
        </div>
      </div>
    </div>
  )
}
