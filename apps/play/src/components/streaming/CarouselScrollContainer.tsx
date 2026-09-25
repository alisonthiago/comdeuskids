import React, { useState, useRef, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CarouselScrollContainerProps {
  children: React.ReactNode
  scrollStep?: number
}

export default function CarouselScrollContainer({
  children,
  scrollStep = 680
}: CarouselScrollContainerProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(false)

  const updateArrows = useCallback(() => {
    if (!scrollRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
    setShowLeft(scrollLeft > 20)
    setShowRight(scrollWidth > clientWidth + 10 && scrollLeft < scrollWidth - clientWidth - 20)
  }, [])

  useEffect(() => {
    updateArrows()
    const el = scrollRef.current
    if (!el) return

    const resizeObserver = new ResizeObserver(() => {
      updateArrows()
    })
    resizeObserver.observe(el)

    // Também verifica após renderização inicial das imagens
    const timeout = setTimeout(updateArrows, 400)

    return () => {
      resizeObserver.disconnect()
      clearTimeout(timeout)
    }
  }, [updateArrows, children])

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return
    const offset = direction === 'left' ? -scrollStep : scrollStep
    scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' })
  }

  return (
    <div style={{ position: 'relative' }}>
      {showLeft && (
        <button
          type="button"
          onClick={() => scroll('left')}
          className="cdk-desktop-only"
          aria-label="Rolar para a esquerda"
          style={{
            position: 'absolute',
            left: -16,
            top: '45%',
            transform: 'translateY(-50%)',
            zIndex: 30,
            width: 44,
            height: 44,
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 16, 20, 0.94)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.8), 0 0 12px rgba(160, 120, 255, 0.2)',
            transition: 'transform 0.15s ease, background-color 0.15s ease'
          }}
        >
          <ChevronLeft size={22} />
        </button>
      )}

      <div
        ref={scrollRef}
        onScroll={updateArrows}
        className="no-scrollbar"
        style={{
          display: 'flex',
          gap: 18,
          overflowX: 'auto',
          overflowY: 'hidden',
          scrollBehavior: 'smooth',
          paddingBottom: 44,
          paddingTop: 34,
          marginTop: -26,
          marginBottom: -34,
          paddingLeft: 4,
          paddingRight: 4
        }}
      >
        {children}
      </div>

      {showRight && (
        <button
          type="button"
          onClick={() => scroll('right')}
          className="cdk-desktop-only"
          aria-label="Rolar para a direita"
          style={{
            position: 'absolute',
            right: -16,
            top: '45%',
            transform: 'translateY(-50%)',
            zIndex: 30,
            width: 44,
            height: 44,
            borderRadius: '50%',
            backgroundColor: 'rgba(16, 16, 20, 0.94)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.8), 0 0 12px rgba(160, 120, 255, 0.2)',
            transition: 'transform 0.15s ease, background-color 0.15s ease'
          }}
        >
          <ChevronRight size={22} />
        </button>
      )}
    </div>
  )
}
