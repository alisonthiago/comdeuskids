import React, { useRef, useState, useEffect } from 'react'
import {
  Palette,
  Eraser,
  RotateCcw,
  RotateCw,
  Maximize2,
  Minimize2,
  Printer,
  Download,
  Trash2,
  CheckCircle,
  Sparkles
} from 'lucide-react'

interface ColoringStudioProps {
  initialInstructions?: string
  storageKey?: string
  onSave?: (dataUrl: string) => void
  readOnly?: boolean
}

export function ColoringStudio({
  initialInstructions = 'Pinte com muito carinho e criatividade!',
  storageKey = 'cdk_drawing_draft',
  onSave,
  readOnly = false
}: ColoringStudioProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)
  
  const [isDrawing, setIsDrawing] = useState(false)
  const [selectedColor, setSelectedColor] = useState('#ef4444')
  const [brushSize, setBrushSize] = useState(8)
  const [isEraser, setIsEraser] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  // Pilhas de Histórico para Desfazer/Refazer
  const [undoStack, setUndoStack] = useState<ImageData[]>([])
  const [redoStack, setRedoStack] = useState<ImageData[]>([])

  const palette = [
    '#ef4444', '#f97316', '#facc15', '#22c55e', '#10b981',
    '#06b6d4', '#3b82f6', '#6366f1', '#a855f7', '#ec4899',
    '#78350f', '#000000', '#64748b', '#ffffff'
  ]

  // Inicializar o canvas e carregar rascunho anterior
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Carregar desenho salvo no localStorage se existir
    const saved = localStorage.getItem(storageKey)
    if (saved) {
      const img = new Image()
      img.onload = () => {
        ctx.drawImage(img, 0, 0)
        saveState()
      }
      img.src = saved
    } else {
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      saveState()
    }
  }, [])

  // Salvar estado atual na pilha de undo
  const saveState = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
    setUndoStack(prev => [...prev.slice(-15), data]) // Mantém até 15 passos
    setRedoStack([])

    // Autosave no localStorage
    const dataUrl = canvas.toDataURL('image/png')
    localStorage.setItem(storageKey, dataUrl)
    if (onSave) onSave(dataUrl)
  }

  // Desfazer (Undo)
  const handleUndo = () => {
    if (undoStack.length <= 1) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const currentState = undoStack[undoStack.length - 1]
    const previousState = undoStack[undoStack.length - 2]

    setRedoStack(prev => [...prev, currentState])
    setUndoStack(prev => prev.slice(0, -1))

    ctx.putImageData(previousState, 0, 0)
  }

  // Refazer (Redo)
  const handleRedo = () => {
    if (redoStack.length === 0) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const nextState = redoStack[redoStack.length - 1]
    setRedoStack(prev => prev.slice(0, -1))
    setUndoStack(prev => [...prev, nextState])

    ctx.putImageData(nextState, 0, 0)
  }

  // Início do Traço (Mouse e Touch)
  const handleStart = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (readOnly) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    setIsDrawing(true)
    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    ctx.beginPath()
    ctx.moveTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY)
  }

  // Desenhar (Mouse e Touch)
  const handleMove = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing || readOnly) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
    const scaleY = canvas.height / rect.height

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY

    ctx.strokeStyle = isEraser ? '#ffffff' : selectedColor
    ctx.lineWidth = brushSize
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineTo((clientX - rect.left) * scaleX, (clientY - rect.top) * scaleY)
    ctx.stroke()
  }

  // Fim do Traço
  const handleEnd = () => {
    if (!isDrawing) return
    setIsDrawing(false)
    saveState()
  }

  // Limpar Tela
  const handleClear = () => {
    if (readOnly) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    saveState()
  }

  // Imprimir
  const handlePrint = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL('image/png')
    const win = window.open('', '_blank')
    if (win) {
      win.document.write(`<html><head><title>Com Deus Kids - Desenho</title></head><body style="margin:0;display:flex;justify-content:center;align-items:center;height:100vh;"><img src="${dataUrl}" style="max-width:90%;max-height:90%;"/></body></html>`)
      win.document.close()
      win.print()
    }
  }

  // Alternar Tela Cheia
  const toggleFullscreen = () => {
    if (!containerRef.current) return
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {})
      setIsFullscreen(true)
    } else {
      document.exitFullscreen().catch(() => {})
      setIsFullscreen(false)
    }
  }

  return (
    <div
      ref={containerRef}
      style={{
        background: '#13141c',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.4)'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <p style={{ margin: 0, fontSize: '14px', color: '#cbd5e1', fontWeight: 600 }}>
          {initialInstructions}
        </p>

        {/* Controles de Ação (Desfazer, Refazer, Imprimir, Fullscreen) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handleUndo}
            disabled={undoStack.length <= 1}
            title="Desfazer traço"
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: undoStack.length <= 1 ? '#64748b' : '#fff',
              cursor: undoStack.length <= 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px'
            }}
          >
            <RotateCcw size={14} /> Desfazer
          </button>

          <button
            onClick={handleRedo}
            disabled={redoStack.length === 0}
            title="Refazer traço"
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: redoStack.length === 0 ? '#64748b' : '#fff',
              cursor: redoStack.length === 0 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px'
            }}
          >
            <RotateCw size={14} /> Refazer
          </button>

          <button
            onClick={handlePrint}
            title="Imprimir desenho"
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px'
            }}
          >
            <Printer size={14} /> Imprimir
          </button>

          <button
            onClick={toggleFullscreen}
            title="Tela cheia"
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px'
            }}
          >
            {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      {/* Barra de Ferramentas de Pintura */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        background: '#0b0c10',
        padding: '12px 16px',
        borderRadius: '10px',
        border: '1px solid rgba(255,255,255,0.06)'
      }}>
        {/* Paleta de Cores */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          {palette.map(c => (
            <button
              key={c}
              onClick={() => {
                setSelectedColor(c)
                setIsEraser(false)
              }}
              style={{
                width: '26px',
                height: '26px',
                borderRadius: '50%',
                background: c,
                border: selectedColor === c && !isEraser ? '3px solid #fff' : '1px solid rgba(0,0,0,0.3)',
                cursor: 'pointer',
                transform: selectedColor === c && !isEraser ? 'scale(1.15)' : 'scale(1)',
                transition: 'transform 0.1s ease'
              }}
            />
          ))}
        </div>

        {/* Ajuste de Espessura do Traço e Ferramenta */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '11px', color: '#94a3b8' }}>Espessura:</span>
            <input
              type="range"
              min="3"
              max="36"
              value={brushSize}
              onChange={e => setBrushSize(Number(e.target.value))}
              style={{ width: '80px', accentColor: '#a855f7', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '11px', color: '#fff', width: '24px' }}>{brushSize}px</span>
          </div>

          <button
            onClick={() => setIsEraser(!isEraser)}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              background: isEraser ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.06)',
              color: isEraser ? '#ef4444' : '#cbd5e1',
              border: isEraser ? '1px solid #ef4444' : '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            <Eraser size={14} /> Borracha
          </button>

          <button
            onClick={handleClear}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              background: 'rgba(255,255,255,0.06)',
              color: '#cbd5e1',
              border: '1px solid rgba(255,255,255,0.1)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '12px'
            }}
          >
            <Trash2 size={14} /> Limpar
          </button>
        </div>
      </div>

      {/* Canvas da Pintura Digital */}
      <div style={{
        borderRadius: '12px',
        overflow: 'hidden',
        border: '2px solid rgba(255,255,255,0.15)',
        background: '#ffffff',
        position: 'relative',
        touchAction: 'none' // Evita scrolling em dispositivos mobile/touch
      }}>
        <canvas
          ref={canvasRef}
          width={800}
          height={450}
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
          style={{
            display: 'block',
            width: '100%',
            height: 'auto',
            cursor: isEraser ? 'cell' : 'crosshair'
          }}
        />
      </div>
    </div>
  )
}
