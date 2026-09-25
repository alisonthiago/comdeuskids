import React, { useEffect, useRef, useState } from 'react'

export interface ScrollRevealSectionProps {
  children: React.ReactNode
  threshold?: number
  delay?: number
  style?: React.CSSProperties
  className?: string
}

/**
 * ScrollRevealSection — Com Deus Kids
 * Revelação suave e cinematográfica de seções ao rolar a página verticalmente.
 * Inicialmente com leve opacidade e leve translateY, atingindo 100% de nitidez ao entrar na viewport.
 */
export default function ScrollRevealSection({
  children,
  threshold = 0.08,
  delay = 0,
  style,
  className
}: ScrollRevealSectionProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Se já estiver na primeira dobra do desktop ou mobile, revela imediatamente
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight * 0.95) {
      setIsVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(el)
        }
      },
      { threshold, rootMargin: '0px 0px -40px 0px' }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: isVisible ? 1 : 0.18,
        transform: isVisible ? 'translateY(0)' : 'translateY(30px)',
        filter: isVisible ? 'blur(0)' : 'blur(5px)',
        transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, filter 0.65s ease ${delay}ms`,
        willChange: 'opacity, transform, filter',
        ...style
      }}
    >
      {children}
    </div>
  )
}
