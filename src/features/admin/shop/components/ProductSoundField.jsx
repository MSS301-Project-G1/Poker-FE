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
      setErrorMsg('The sound file is larger than 2 MB.')
      return
    }

    const ext = file.name.split('.').pop()?.toLowerCase()
    if (!['mp3', 'ogg', 'wav'].includes(ext)) {
      setErrorMsg('Only MP3, OGG and WAV are supported.')
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
    <div className="p-4 rounded-2xl bg-obsidian/30 border border-on-surface/10 space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-tertiary-fixed flex items-center gap-2">
          <Icon name="volume_up" className="text-base" />
          <span>Sound effect (optional)</span>
        </label>
        <span className="text-[11px] text-on-surface/50">MP3, OGG, WAV ≤ 2MB</span>
      </div>

      {activeAudioUrl ? (
        <div className="flex items-center justify-between p-3 rounded-xl bg-on-secondary-fixed/40 border border-secondary/30">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleTogglePlay}
              className="w-10 h-10 rounded-full bg-tertiary text-on-tertiary flex items-center justify-center hover:bg-tertiary-fixed transition-colors shadow-lg"
              title={isPlaying ? 'Stop' : 'Preview'}
            >
              <Icon name={isPlaying ? 'pause' : 'play_arrow'} className="text-xl" />
            </button>
            <div className="text-xs">
              <div className="font-bold text-on-surface/90 truncate max-w-[200px] sm:max-w-[280px]">
                {soundFile ? soundFile.name : 'Current sound'}
              </div>
              <div className="text-[11px] text-on-surface/50 mt-0.5">
                {audioDuration > 0
                  ? `${Math.floor(audioCurrentTime)}s / ${Math.floor(audioDuration)}s`
                  : 'Ready to preview'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className="p-2 text-error hover:bg-error/20 rounded-lg transition-colors text-xs flex items-center gap-1"
            title="Remove sound"
          >
            <Icon name="delete" className="text-base" />
            <span className="hidden sm:inline">Remove</span>
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
              setErrorMsg('This sound can’t be played.')
            }}
          />
        </div>
      ) : (
        <div>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="w-full py-3 px-4 rounded-xl border border-dashed border-on-surface/20 hover:border-tertiary/50 bg-on-surface/5 hover:bg-on-surface/10 transition-all text-xs text-on-surface/70 flex items-center justify-center gap-2"
          >
            <Icon name="music_note" className="text-base text-tertiary-fixed" />
            <span>Choose a taunt or card-flip sound</span>
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

      {errorMsg && <p className="text-xs text-error flex items-center gap-1">⚠️ {errorMsg}</p>}
    </div>
  )
}
