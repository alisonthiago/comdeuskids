import React, { useRef, useState, useEffect } from 'react'

interface VirtualControlsProps {
  onMove: (vector: { x: number; y: number; isRunning: boolean }) => void
  onJump: () => void
  onAction?: () => void
  disabled?: boolean
}

export function VirtualControls({ onMove, onJump, onAction, disabled = false }: VirtualControlsProps) {
  const joystickBaseRef = useRef<HTMLDivElement>(null)
  const [touchActive, setTouchActive] = useState(false)
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 })
  const touchIdRef = useRef<number | null>(null)
  const startPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 })

  // Detectar se é touch screen
  const [isTouchDevice, setIsTouchDevice] = useState(false)

  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
    setIsTouchDevice(isTouch)
  }, [])

  if (!isTouchDevice || disabled) return null

  const handleTouchStart = (e: React.TouchEvent) => {
    if (touchIdRef.current !== null) return
    const touch = e.changedTouches[0]
    touchIdRef.current = touch.identifier

    const rect = joystickBaseRef.current?.getBoundingClientRect()
    if (!rect) return

    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    startPosRef.current = { x: centerX, y: centerY }
    setTouchActive(true)

    updateJoystick(touch.clientX, touch.clientY)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i]
      if (touch.identifier === touchIdRef.current) {
        updateJoystick(touch.clientX, touch.clientY)
        break
      }
    }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === touchIdRef.current) {
        touchIdRef.current = null
        setTouchActive(false)
        setKnobPos({ x: 0, y: 0 })
        onMove({ x: 0, y: 0, isRunning: false })
        break
      }
    }
  }

  const updateJoystick = (clientX: number, clientY: number) => {
    const maxRadius = 45
    const dx = clientX - startPosRef.current.x
    const dy = clientY - startPosRef.current.y
    const distance = Math.sqrt(dx * dx + dy * dy)

    let clampedX = dx
    let clampedY = dy

    if (distance > maxRadius) {
      clampedX = (dx / distance) * maxRadius
      clampedY = (dy / distance) * maxRadius
    }

    setKnobPos({ x: clampedX, y: clampedY })

    // Normalizado de -1 a +1
    const normX = clampedX / maxRadius
    const normY = clampedY / maxRadius
    const intensity = Math.min(1, distance / maxRadius)
    const isRunning = intensity > 0.8

    onMove({ x: normX, y: normY, isRunning })
  }

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 50,
        userSelect: 'none'
      }}
    >
      {/* JOYSTICK ANALÓGICO (CANTO INFERIOR ESQUERDO) */}
      <div
        ref={joystickBaseRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        style={{
          position: 'absolute',
          bottom: 30,
          left: 30,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(0,0,0,0.4) 100%)',
          border: '2px solid rgba(255, 255, 255, 0.35)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'auto',
          touchAction: 'none'
        }}
      >
        {/* Marcadores de direção */}
        <div style={{ position: 'absolute', top: 8, color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 'bold' }}>▲</div>
        <div style={{ position: 'absolute', bottom: 8, color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 'bold' }}>▼</div>
        <div style={{ position: 'absolute', left: 8, color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 'bold' }}>◀</div>
        <div style={{ position: 'absolute', right: 8, color: 'rgba(255,255,255,0.4)', fontSize: 11, fontWeight: 'bold' }}>▶</div>

        {/* Knob móvel */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            background: touchActive
              ? 'radial-gradient(circle, #22c55e 0%, #15803d 100%)'
              : 'radial-gradient(circle, #f59e0b 0%, #b45309 100%)',
            boxShadow: '0 4px 15px rgba(0,0,0,0.6)',
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`,
            transition: touchActive ? 'none' : 'transform 0.15s ease-out',
            border: '2px solid #ffffff'
          }}
        />
      </div>

      {/* BOTÕES DE AÇÃO (CANTO INFERIOR DIREITO) */}
      <div
        style={{
          position: 'absolute',
          bottom: 30,
          right: 30,
          display: 'flex',
          gap: 16,
          alignItems: 'flex-end',
          pointerEvents: 'auto'
        }}
      >
        {onAction && (
          <button
            onTouchStart={(e) => {
              e.preventDefault()
              onAction()
            }}
            style={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: '#ffffff',
              border: '2px solid rgba(255,255,255,0.8)',
              boxShadow: '0 8px 24px rgba(29, 78, 216, 0.5)',
              fontSize: 12,
              fontWeight: 900,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              touchAction: 'none'
            }}
          >
            <span>💬</span>
            <span>AÇÃO</span>
          </button>
        )}

        <button
          onTouchStart={(e) => {
            e.preventDefault()
            onJump()
          }}
          style={{
            width: 76,
            height: 76,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #22c55e 0%, #15803d 100%)',
            color: '#ffffff',
            border: '3px solid rgba(255,255,255,0.9)',
            boxShadow: '0 8px 28px rgba(34, 197, 94, 0.6)',
            fontSize: 13,
            fontWeight: 900,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            touchAction: 'none'
          }}
        >
          <span style={{ fontSize: 18 }}>🦘</span>
          <span>PULAR</span>
        </button>
      </div>
    </div>
  )
}
