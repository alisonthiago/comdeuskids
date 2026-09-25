import React from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck, Heart, Tv, Clock, Smile, Sparkles, BookOpen,
  Check, ArrowRight, Download, Gamepad2, Music
} from 'lucide-react'
import { playUrl, membrosUrl } from '../lib/appUrl'

export default function ParaFamilias() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px', color: '#0f172a' }}>
      {/* HERO SECTION */}
      <section style={{ textAlign: 'center', maxWidth: 840, margin: '0 auto 64px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(124, 58, 237, 0.08)', color: '#7c3aed',
          padding: '8px 18px', borderRadius: 999, fontSize: 13, fontWeight: 700,
          marginBottom: 20
        }}>
          <Sparkles size={16} /> Para Pais, Mães e Lares Cristãos
        </div>

        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: 900,
          lineHeight: 1.15,
          color: '#0f172a',
          letterSpacing: '-0.03em',
          marginBottom: 20
        }}>
          O melhor conteúdo bíblico infantil para seus filhos crescerem na fé
        </h1>

        <p style={{
          fontSize: 'clamp(16px, 2.5vw, 19px)',
          color: '#475569',
          lineHeight: 1.6,
          marginBottom: 32
        }}>
          Streaming seguro com historinhas da Bíblia, clipes e louvores, jogos educativos e cadernos de atividades para imprimir no culto doméstico.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
          <Link
            to="/planos"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#7c3aed', color: '#fff', padding: '14px 28px',
              borderRadius: 12, fontWeight: 800, fontSize: 16,
              boxShadow: '0 6px 20px rgba(124, 58, 237, 0.3)'
            }}
          >
            <span>COMEÇAR COM MINHA FAMÍLIA</span>
            <ArrowRight size={18} />
          </Link>

          <a
            href={playUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#f8fafc', color: '#334155', padding: '14px 24px',
              borderRadius: 12, fontWeight: 700, fontSize: 15,
              border: '1px solid #e2e8f0'
            }}
          >
            <Tv size={18} /> Conhecer o Play
          </a>
        </div>
      </section>

      {/* RECURSOS PRINCIPAIS */}
      <section style={{ marginBottom: 72 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
            Tudo o que sua família precisa em um só lugar
          </h2>
          <p style={{ fontSize: 15, color: '#64748b', margin: 0 }}>
            Desenvolvido com carinho para apoiar os pais no discipulado diário dos seus filhos.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #e2e8f0' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>100% Protegido e Livre de Anúncios</h3>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Sem propagandas, sem algoritmos que levam a vídeos estranhos e sem riscos para a inocência dos seus pequenos.
            </p>
          </div>

          <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #e2e8f0' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Clock size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Controle Parental de Tempo de Tela</h3>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Defina o tempo diário máximo de reprodução e bloqueie configurações sensíveis com PIN exclusivo dos responsáveis.
            </p>
          </div>

          <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #e2e8f0' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Smile size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Até 5 Perfis Infantis Personalizados</h3>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Cada filho escolhe seu personagem bíblico favorito (Davi, Sara, Noé, Ester), com recomendações por faixa etária.
            </p>
          </div>

          <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #e2e8f0' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Tv size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Assista no Celular, Tablet e na Smart TV</h3>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Pareie com a televisão da sala em segundos digitando o código de 6 dígitos. Conforto total para reunir a família.
            </p>
          </div>

          <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #e2e8f0' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fce7f3', color: '#be185d', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Download size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Atividades e Desenhos para Imprimir</h3>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Baixe cadernos em PDF com histórias, desenhos bíblicos para colorir e labirintos para momentos offline e devocionais.
            </p>
          </div>

          <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #e2e8f0' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f3e8ff', color: '#6d28d9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Gamepad2 size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Jogos e Quizzes Bíblicos Interativos</h3>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Desafios leves e divertidos que fixam o aprendizado das passagens das Escrituras de forma estimulante.
            </p>
          </div>
        </div>
      </section>

      {/* PLANO FAMÍLIA EM DESTAQUE */}
      <section style={{
        background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
        borderRadius: 24,
        padding: '48px 32px',
        maxWidth: 760,
        margin: '0 auto',
        textAlign: 'center',
        border: '1px solid #ddd6fe'
      }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#7c3aed', letterSpacing: '0.05em', marginBottom: 8 }}>
          ASSINATURA FAMILIAR OFICIAL
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: '#1e1b4b', margin: '0 0 12px' }}>
          Plano Com Deus Kids Família
        </h2>
        <p style={{ fontSize: 15, color: '#475569', marginBottom: 24 }}>
          Tudo o que seus filhos precisam para aprender a Palavra com alegria e segurança.
        </p>

        <div style={{ fontSize: 36, fontWeight: 900, color: '#7c3aed', marginBottom: 20 }}>
          R$ 29,90 <span style={{ fontSize: 16, fontWeight: 600, color: '#64748b' }}>/ mês</span>
          <div style={{ fontSize: 13, color: '#64748b', fontWeight: 500, marginTop: 4 }}>
            ou R$ 299,00 no plano anual
          </div>
        </div>

        <ul style={{
          listStyle: 'none', padding: 0, margin: '0 auto 28px', maxWidth: 420,
          textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 10
        }}>
          <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
            <Check size={18} color="#16a34a" /> Acesso ilimitado a filmes, séries e desenhos
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
            <Check size={18} color="#16a34a" /> Até 5 perfis infantis com controle de tempo
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
            <Check size={18} color="#16a34a" /> Download ilimitado de cadernos de colorir e PDFs
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
            <Check size={18} color="#16a34a" /> Reprodução na TV, computador, tablet e celular
          </li>
        </ul>

        <Link
          to="/planos"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#7c3aed', color: '#fff', padding: '14px 32px',
            borderRadius: 12, fontWeight: 800, fontSize: 16,
            boxShadow: '0 6px 20px rgba(124, 58, 237, 0.3)'
          }}
        >
          <span>ASSINAR PLANO FAMÍLIA</span>
          <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  )
}
