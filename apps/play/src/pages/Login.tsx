import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@comdeuskids/supabase'
import { ArrowRight, Eye, Facebook, Lock, Mail } from 'lucide-react'
import { siteUrl } from '../lib/appUrl'
import '../styles/login.css'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    const { error: loginError } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)

    if (loginError) {
      setError('E-mail ou senha incorretos. Verifique suas credenciais.')
      return
    }

    const params = new URLSearchParams(window.location.search)
    const returnTo = params.get('returnTo') || params.get('redirect')
    navigate(returnTo ? decodeURIComponent(returnTo) : '/selecionar-perfil')
  }

  return (
    <main className="login-page">
      <section className="login-panel" aria-label="Acessar a Com Deus Kids">
        <div className="login-card">
          <img className="login-brand" src="/images/login-brand.svg" alt="Com Deus Kids" />

          <div className="login-heading">
            <h1>Crescer com Deus desde a infância.</h1>
            <p>Acesse sua conta para continuar sua jornada.</p>
          </div>

          {error && <p className="login-error" role="alert">{error}</p>}

          <form className="login-form" onSubmit={handleLogin}>
            <label className="login-field">
              <span className="sr-only">E-mail</span>
              <Mail aria-hidden="true" size={20} strokeWidth={2.2} />
              <input type="email" required autoComplete="email" placeholder="Digite seu e-mail" value={email} onChange={(event) => setEmail(event.target.value)} />
            </label>

            <label className="login-field">
              <span className="sr-only">Senha</span>
              <Lock aria-hidden="true" size={20} strokeWidth={2.2} />
              <input type={showPassword ? 'text' : 'password'} required autoComplete="current-password" placeholder="Digite sua senha" value={password} onChange={(event) => setPassword(event.target.value)} />
              <button type="button" className="password-toggle" onClick={() => setShowPassword((visible) => !visible)} aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}>
                <Eye size={20} strokeWidth={2.2} />
              </button>
            </label>

            <div className="login-options">
              <label className="remember-login"><input type="checkbox" defaultChecked /><span>Manter-me conectado</span></label>
              <a href="mailto:suporte@comdeuskids.com.br?subject=Recuperação%20de%20senha">Esqueci minha senha?</a>
            </div>

            <button className="submit-login" type="submit" disabled={loading}>
              {loading ? 'Entrando...' : 'Entrar'} {!loading && <ArrowRight size={25} strokeWidth={2.5} />}
            </button>
          </form>

          <div className="login-divider"><span>ou continue com</span></div>

          <div className="login-socials" aria-label="Outras opções de acesso">
            <a className="social-login google-login" href={`${siteUrl}/planos`} target="_blank" rel="noreferrer" aria-label="Conheça os planos Com Deus Kids">G</a>
            <button className="social-login apple-login" type="button" onClick={() => navigate('/primeiro-acesso')} aria-label="Testar primeiro acesso"></button>
            <button className="social-login facebook-login" type="button" onClick={() => navigate('/selecionar-perfil')} aria-label="Entrar diretamente para selecionar perfil"><Facebook size={25} fill="currentColor" /></button>
          </div>

          <p className="create-account">Ainda não tem uma conta? <a href={`${siteUrl}/planos`} target="_blank" rel="noreferrer">Criar uma conta</a></p>
        </div>
      </section>

      <aside className="login-hero" aria-label="Com Deus Kids">
        <img src="/images/login-hero.png" alt="Criança sorrindo em um campo próximo a uma igreja" />
      </aside>
    </main>
  )
}
