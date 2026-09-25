import { useEffect } from 'react'
import '../styles/brand-intro.css'

type BrandIntroProps = { onComplete: () => void }

/** Entrada visual oficial; o ponto de áudio será conectado futuramente. */
export default function BrandIntro({ onComplete }: BrandIntroProps) {
  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timer = window.setTimeout(onComplete, reduceMotion ? 0 : 2000)
    return () => window.clearTimeout(timer)
  }, [onComplete])

  return (
    <section className="brand-intro" aria-label="Abertura Com Deus Kids">
      <div className="brand-intro__mark" aria-hidden="true">
        <img className="brand-intro__part brand-intro__smile" src="/images/logo-animacao-entrada-perfil.svg" alt="" />
        <img className="brand-intro__part brand-intro__kids" src="/images/logo-animacao-entrada-perfil.svg" alt="" />
        <img className="brand-intro__part brand-intro__com-deus" src="/images/logo-animacao-entrada-perfil.svg" alt="" />
        <img className="brand-intro__full-logo" src="/images/logo-animacao-entrada-perfil.svg" alt="" />
      </div>
      <button className="brand-intro__skip" type="button" onClick={onComplete}>Pular introdução</button>
    </section>
  )
}
