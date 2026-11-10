import { useState, useRef, useEffect, useCallback } from 'react'
import { Icon, Button } from '@/shared/ui'

// Canvas không đọc được biến CSS: lấy kênh RGB của token rồi ghép thành màu.
const tokenColor = (name, alpha = 1) =>
  `rgb(${getComputedStyle(document.documentElement).getPropertyValue(`--color-${name}`).trim()} / ${alpha})`

export default function ImageCropperModal({
  isOpen,
  imageSrc,
  onClose,
  onCropComplete,
  cropShape = 'circle', // 'circle' | 'square'
  outputSize = 512,
  title = 'Crop image',
}) {
  const canvasRef = useRef(null)
  const [imageObj, setImageObj] = useState(null)
  const [zoom, setZoom] = useState(1.0)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [activeShape, setActiveShape] = useState(cropShape)

  // Load image when imageSrc changes
  useEffect(() => {
    if (!isOpen || !imageSrc) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      setImageObj(img)
      setZoom(1.0)
      setOffset({ x: 0, y: 0 })
    }
    img.src = imageSrc
  }, [isOpen, imageSrc])

  // Redraw preview canvas
  const drawPreview = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas || !imageObj) return

    const ctx = canvas.getContext('2d')
    const size = canvas.width
    ctx.clearRect(0, 0, size, size)

    // Calculate dimensions with zoom
    const baseScale = Math.max(size / imageObj.width, size / imageObj.height)
    const drawWidth = imageObj.width * baseScale * zoom
    const drawHeight = imageObj.height * baseScale * zoom

    // Center plus offset
    const dx = (size - drawWidth) / 2 + offset.x
    const dy = (size - drawHeight) / 2 + offset.y

    // 1. Draw base image
    ctx.drawImage(imageObj, dx, dy, drawWidth, drawHeight)

    // 2. Draw overlay mask with clear viewport
    ctx.save()
    ctx.fillStyle = tokenColor('obsidian', 0.75)
    ctx.beginPath()
    ctx.rect(0, 0, size, size)

    const center = size / 2
    const radius = size * 0.42

    if (activeShape === 'circle') {
      ctx.arc(center, center, radius, 0, Math.PI * 2, true)
    } else {
      const boxSize = radius * 2
      const bx = center - radius
      const by = center - radius
      // Counter-clockwise rectangle to cut hole
      ctx.rect(bx + boxSize, by, -boxSize, boxSize)
    }
    ctx.closePath()
    ctx.fill('evenodd')

    // 3. Draw guiding border
    ctx.strokeStyle = tokenColor('tertiary')
    ctx.lineWidth = 3
    ctx.beginPath()
    if (activeShape === 'circle') {
      ctx.arc(center, center, radius, 0, Math.PI * 2)
    } else {
      ctx.strokeRect(center - radius, center - radius, radius * 2, radius * 2)
    }
    ctx.stroke()

    // 4. Subtle grid lines inside crop area
    ctx.strokeStyle = tokenColor('on-surface', 0.15)
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.moveTo(center - radius, center)
    ctx.lineTo(center + radius, center)
    ctx.moveTo(center, center - radius)
    ctx.lineTo(center, center + radius)
    ctx.stroke()

    ctx.restore()
  }, [imageObj, zoom, offset, activeShape])

  useEffect(() => {
    drawPreview()
  }, [drawPreview])

  if (!isOpen || !imageSrc) return null

  // Mouse / Touch handlers for panning
  const handleMouseDown = e => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y })
  }

  const handleMouseMove = e => {
    if (!isDragging) return
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }

  const handleMouseUp = () => setIsDragging(false)

  // Zoom controls
  const handleZoomChange = e => {
    setZoom(parseFloat(e.target.value))
  }

  const handleReset = () => {
    setZoom(1.0)
    setOffset({ x: 0, y: 0 })
  }

  // Export cropped image
  const handleConfirmCrop = () => {
    if (!imageObj) return

    const exportCanvas = document.createElement('canvas')
    exportCanvas.width = outputSize
    exportCanvas.height = outputSize
    const exportCtx = exportCanvas.getContext('2d')

    const previewSize = canvasRef.current ? canvasRef.current.width : 360
    const cropRadius = previewSize * 0.42
    const cropCenter = previewSize / 2

    const baseScale = Math.max(previewSize / imageObj.width, previewSize / imageObj.height)
    const drawWidth = imageObj.width * baseScale * zoom
    const drawHeight = imageObj.height * baseScale * zoom

    const dx = (previewSize - drawWidth) / 2 + offset.x
    const dy = (previewSize - drawHeight) / 2 + offset.y

    // Calculate source rect
    const sx = ((cropCenter - cropRadius - dx) / drawWidth) * imageObj.width
    const sy = ((cropCenter - cropRadius - dy) / drawHeight) * imageObj.height
    const sWidth = ((cropRadius * 2) / drawWidth) * imageObj.width
    const sHeight = ((cropRadius * 2) / drawHeight) * imageObj.height

    exportCtx.drawImage(
      imageObj,
      sx,
      sy,
      sWidth,
      sHeight,
      0,
      0,
      outputSize,
      outputSize
    )

    exportCanvas.toBlob(blob => {
      const dataUrl = exportCanvas.toDataURL('image/png')
      const croppedFile = new File([blob], 'cropped_avatar.png', { type: 'image/png' })
      onCropComplete?.(croppedFile, dataUrl)
      onClose()
    }, 'image/png')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-obsidian/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-surface-container-lowest border border-tertiary/50 shadow-raised p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-on-surface/10">
          <div className="flex items-center gap-2.5">
            <span className="w-9 h-9 rounded-xl bg-tertiary text-on-tertiary flex items-center justify-center font-bold">
              <Icon name="crop" className="text-xl" />
            </span>
            <div>
              <h3 className="font-headline font-bold text-base text-on-surface">{title}</h3>
              <p className="text-[11px] text-on-surface/50">
                Drag to position and use the slider to zoom
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-on-surface/10 hover:bg-on-surface/20 text-on-surface flex items-center justify-center"
          >
            <Icon name="close" className="text-base" />
          </button>
        </div>

        {/* Canvas Stage */}
        <div className="flex flex-col items-center">
          <div
            className="relative rounded-2xl overflow-hidden border-2 border-on-surface/15 bg-obsidian cursor-grab active:cursor-grabbing select-none shadow-inner"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <canvas
              ref={canvasRef}
              width={360}
              height={360}
              className="block"
            />
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-obsidian/60 text-[11px] text-tertiary-fixed font-bold border border-tertiary/30 pointer-events-none flex items-center gap-1">
              <Icon name="pan_tool" className="text-xs" />
              <span>Drag to move</span>
            </div>
          </div>
        </div>

        {/* Controls: Zoom & Shape */}
        <div className="space-y-3 p-3.5 rounded-2xl bg-obsidian/40 border border-on-surface/10">
          {/* Zoom Slider */}
          <div className="flex items-center gap-3">
            <Icon name="zoom_out" className="text-on-surface/50 text-sm" />
            <input
              type="range"
              min="1.0"
              max="3.0"
              step="0.05"
              value={zoom}
              onChange={handleZoomChange}
              className="flex-grow accent-tertiary cursor-pointer h-1.5 rounded-lg bg-on-surface/20"
            />
            <Icon name="zoom_in" className="text-on-surface/50 text-sm" />
            <span className="font-mono text-xs text-tertiary-fixed w-12 text-right">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={handleReset}
              title="Reset"
              className="px-2 py-1 rounded-lg bg-on-surface/10 hover:bg-on-surface/20 text-xs text-on-surface/80"
            >
              Reset
            </button>
          </div>

          {/* Shape Selector */}
          <div className="flex items-center justify-between text-xs pt-2 border-t border-on-surface/10">
            <span className="text-on-surface/60 font-medium">Guide:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveShape('circle')}
                className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeShape === 'circle'
                    ? 'bg-tertiary text-on-tertiary shadow-md'
                    : 'bg-on-surface/10 text-on-surface/70 hover:bg-on-surface/15'
                }`}
              >
                <Icon name="radio_button_checked" className="text-xs" />
                <span>Round (avatar/dealer)</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveShape('square')}
                className={`px-3 py-1 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                  activeShape === 'square'
                    ? 'bg-tertiary text-on-tertiary shadow-md'
                    : 'bg-on-surface/10 text-on-surface/70 hover:bg-on-surface/15'
                }`}
              >
                <Icon name="crop_square" className="text-xs" />
                <span>Square</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="secondary" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="gold"
            size="md"
            icon="crop"
            onClick={handleConfirmCrop}
          >
            Crop
          </Button>
        </div>
      </div>
    </div>
  )
}
