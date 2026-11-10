import { useState, useRef, useEffect } from 'react'
import { Icon } from '@/shared/ui'

export default function ProductSoundField({
  soundFile = null,
  onSoundFileChange = () => {},
  existingSoundUrl = null,
  onDeleteExistingSound = null,
  disabled = false,
}) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioDuration, setAudioDuration] = useState(0)
  const [audioCurrentTime, setAudioCurrentTime] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const audioRef = useRef(null)
  const fileInputRef = useRef(null)

  const activeAudioUrl = soundFile ? URL.createObjectURL(soundFile) : existingSoundUrl

  useEffect(() => {
    setIsPlaying(false)
    setAudioCurrentTime(0)
    setErrorMsg('')
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.load()
    }
    return () => {
      if (soundFile && activeAudioUrl) {
        URL.revokeObjectURL(activeAudioUrl)
      }
    }
  }, [soundFile, existingSoundUrl])

  const handleFileSelect = e => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Tệp âm thanh vượt quá 2MB.')
      return
    }

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['mp3', 'ogg', 'wav'].includes(ext)) {
      setErrorMsg('Chỉ hỗ trợ định dạng MP3, OGG, WAV.')
      return
    }

    setErrorMsg('')
    onSoundFileChange(file)
  }

  const handleTogglePlay = () => {
    if (!audioRef.current || !activeAudioUrl) return
    if (isPlaying) {
      audioRef.current.pause()
      setIsPlaying(false)
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false))
    }
  }

  const handleClear = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    onSoundFileChange(null)
    if (existingSoundUrl && onDeleteExistingSound) {
      onDeleteExistingSound()
    }
  }

  return (
    <div className="p-4 rounded-2xl bg-black/30 border border-white/10 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-amber-300 flex items-center gap-2">
          <Icon name="volume_up" className="text-base" />
          <span>Tệp Âm Thanh Hiệu Ứng (Tùy chọn)</span>
        </label>
        <span className="text-[11px] text-white/50">MP3, OGG, WAV ≤ 2MB</span>
      </div>

      {activeAudioUrl ? (
        <div className="flex items-center justify-between p-3 rounded-xl bg-purple-950/40 border border-purple-400/30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleTogglePlay}
              className="w-10 h-10 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center hover:bg-amber-300 transition-colors shadow-lg"
              title={isPlaying ? 'Dừng phát' : 'Nghe thử'}
            >
              <Icon name={isPlaying ? 'pause' : 'play_arrow'} className="text-xl" />
            </button>
            <div className="text-xs">
              <div className="font-bold text-white/90 truncate max-w-[200px] sm:max-w-[280px]">
                {soundFile ? soundFile.name : 'Tệp âm thanh hiện tại của sản phẩm'}
              </div>
              <div className="text-[10px] text-white/50 mt-0.5">
                {audioDuration > 0
                  ? `${Math.floor(audioCurrentTime)}s / ${Math.floor(audioDuration)}s`
                  : 'Sẵn sàng nghe thử'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className="p-2 text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors text-xs flex items-center gap-1"
            title="Gỡ âm thanh"
          >
            <Icon name="delete" className="text-base" />
            <span className="hidden sm:inline">Gỡ</span>
          </button>

          <audio
            ref={audioRef}
            src={activeAudioUrl}
            onLoadedMetadata={e => setAudioDuration(e.currentTarget.duration)}
            onTimeUpdate={e => setAudioCurrentTime(e.currentTarget.currentTime)}
            onEnded={() => {
              setIsPlaying(false)
              setAudioCurrentTime(0)
            }}
            onError={() => {
              setIsPlaying(false)
              setErrorMsg('Không thể phát tệp âm thanh này.')
            }}
          />
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="w-full py-3 px-4 rounded-xl border border-dashed border-white/20 hover:border-amber-400/50 bg-white/5 hover:bg-white/10 transition-all text-xs text-white/70 flex items-center justify-center gap-2"
          >
            <Icon name="music_note" className="text-base text-amber-300" />
            <span>Chọn tệp âm thanh trêu đùa / hiệu ứng lật bài</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".mp3,.ogg,.wav,audio/mpeg,audio/ogg,audio/wav"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>
      )}

      {errorMsg && <p className="text-xs text-rose-400 flex items-center gap-1">⚠️ {errorMsg}</p>}
    </div>
  )
}
