import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { AlertCircle, CircleHelp, Eye, EyeOff, Sparkles } from 'lucide-react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError('')
    setLoading(true)
    const { error: signInError } = await signIn(email, password)
    setLoading(false)
    if (signInError) return setError('E-mail ou senha incorretos.')
    navigate('/admin')
  }

  return (
    <div className="hot-login">
      <section className="hot-login__panel">
        <header className="hot-login__topbar">
          <div className="hot-login__logo"><span><Sparkles size={23} fill="currentColor" /></span>comdeus<small>kids</small></div>
          <a href="mailto:suporte@comdeuskids.com.br" className="hot-login__help"><CircleHelp size={15} /> Ajuda</a>
        </header>

        <main className="hot-login__form-wrap">
          <h1>Entrar</h1>
          <p>Entre com sua conta para continuar sua jornada</p>

          <div className="hot-login__socials">
            <button type="button"><b className="hot-login__google">G</b> Entrar com Google</button>
            <button type="button"><b className="hot-login__apple">●</b> Entrar com Apple</button>
          </div>
          <div className="hot-login__separator"><span />ou<span /></div>

          {error && <div className="hot-login__error"><AlertCircle size={16} />{error}</div>}
          <form onSubmit={submit}>
            <label>E-mail<input type="email" placeholder="Digite seu e-mail ou usuário" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} required /></label>
            <label>Senha<div className="hot-login__password"><input type={showPassword ? 'text' : 'password'} placeholder="Sua senha" autoComplete="current-password" value={password} onChange={event => setPassword(event.target.value)} required /><button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Mostrar ou ocultar senha">{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}</button></div></label>
            <a href="mailto:suporte@comdeuskids.com.br?subject=Recuperação de senha" className="hot-login__forgot">Esqueci minha senha</a>
            <button className="hot-login__submit" type="submit" disabled={loading}>{loading ? 'Entrando…' : 'Entrar'}</button>
          </form>
          <div className="hot-login__new-account">Não tem uma conta? <a href="mailto:suporte@comdeuskids.com.br?subject=Novo acesso">Criar conta</a></div>
          <footer><a href="mailto:suporte@comdeuskids.com.br">Suporte</a><i /> <a href="#termos">Termos de Uso</a><i /> <a href="#privacidade">Política de Privacidade</a></footer>
        </main>
      </section>
      <aside className="hot-login__image" aria-label="Criança usando celular" />
    </div>
  )
}
