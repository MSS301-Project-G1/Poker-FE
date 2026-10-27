import { useState } from 'react'
import { Icon, Button } from '@/shared/ui'

export default function AiGeneratorTutorialModal({ isOpen, onClose }) {
  const [activeStep, setActiveStep] = useState(0)

  if (!isOpen) return null

  const steps = [
    {
      title: 'Bước 1: Chọn Danh Mục Tài Nguyên',
      desc: 'Chọn loại tài nguyên bạn muốn AI tạo: Cô Em Chia Bài (DEALER), Bộ Skin Bài 52 Lá (CARD_SKIN), hoặc Bàn Poker (TABLE).',
      icon: 'category',
      tag: 'Chọn Mục',
    },
    {
      title: 'Bước 2: Tải Lên Ảnh Mẫu Nhân Vật',
      desc: 'Tải lên 1 ảnh chân dung cô gái (PNG/JPG) hoặc dùng ảnh mẫu có sẵn. AI Gemini sẽ phân tích trang phục, khuôn mặt và kiểu tóc.',
      icon: 'face',
      tag: 'Tải Ảnh',
    },
    {
      title: 'Bước 3: Chọn Mô Hình AI & Tông Màu',
      desc: 'Chọn Gemini 1.5 Pro hoặc Imagen. Bạn có thể chọn màu váy/áo, phụ kiện và thêm mô tả ý tưởng chi tiết (tối đa 500 ký tự).',
      icon: 'palette',
      tag: 'Tùy Chỉnh',
    },
    {
      title: 'Bước 4: Bắt Đầu Sinh & Áp Dụng Vào Shop',
      desc: 'Bấm nút "Bắt Đầu Sinh Bằng AI". Hệ thống tự động tạo 4 tư thế (Chờ, Chia bài, Lật bài, Ăn mừng), đóng gói ZIP và tạo sản phẩm vào Shop!',
      icon: 'auto_awesome',
      tag: 'Hoàn Tất',
    },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-3xl rounded-3xl bg-[#120824] border border-purple-500/40 shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-purple-500/30">
              <Icon name="play_circle" className="text-2xl" />
            </span>
            <div>
              <h2 className="font-headline font-black text-lg sm:text-xl text-white">
                Hướng Dẫn Sử Dụng: AI Studio Tạo Cô Em Chia Bài
              </h2>
              <p className="text-xs text-white/50">
                Dành cho Quản trị viên • Tự động hóa từ 1 ảnh chân dung
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white flex items-center justify-center transition-all"
          >
            <Icon name="close" className="text-lg" />
          </button>
        </div>

        {/* Video Tutorial Display */}
        <div className="rounded-2xl overflow-hidden border border-purple-500/30 bg-black/60 shadow-inner relative group">
          <img
            src="/tutorials/dealer_generation_tutorial.webp"
            alt="AI Dealer Generation Tutorial Video"
            className="w-full h-auto max-h-[360px] object-contain mx-auto"
            onError={e => {
              // Fallback if video is not yet created
              e.target.style.display = 'none'
              const fallback = document.getElementById('tutorial-video-fallback')
              if (fallback) fallback.style.display = 'flex'
            }}
          />
          <div
            id="tutorial-video-fallback"
            style={{ display: 'none' }}
            className="w-full h-64 flex flex-col items-center justify-center p-6 text-center space-y-3 bg-gradient-to-b from-purple-950/40 to-black/80"
          >
            <div className="w-16 h-16 rounded-3xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Icon name="smart_display" className="text-3xl" />
            </div>
            <div className="font-bold text-sm text-purple-200">Video Demo Đang Được Chuẩn Bị</div>
            <p className="text-xs text-white/50 max-w-md">
              Xem các bước hướng dẫn bên dưới để thực hiện tạo cô em chia bài từ ảnh tham chiếu ngay lập tức.
            </p>
          </div>
        </div>

        {/* 4 Interactive Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {steps.map((st, idx) => (
            <div
              key={idx}
              onClick={() => setActiveStep(idx)}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                activeStep === idx
                  ? 'bg-purple-500/20 border-purple-400/80 shadow-lg shadow-purple-500/20'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="flex items-center gap-2 font-bold text-xs text-purple-300">
                  <Icon name={st.icon} className="text-base" />
                  <span>{st.title}</span>
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/70 font-mono">
                  {st.tag}
                </span>
              </div>
              <p className="text-[11px] text-white/70 leading-relaxed">{st.desc}</p>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="text-xs text-white/40">
            Hệ thống hỗ trợ: Google Gemini 1.5 Pro & Python Pillow Sandbox
          </div>
          <Button variant="gold" size="md" icon="check" onClick={onClose}>
            Đã Hiểu, Bắt Đầu Thử!
          </Button>
        </div>
      </div>
    </div>
  )
}
