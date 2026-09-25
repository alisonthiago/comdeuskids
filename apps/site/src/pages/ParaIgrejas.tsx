import React from 'react'
import { Link } from 'react-router-dom'
import {
  Church, QrCode, ShieldCheck, Users, BookOpen, Sparkles,
  ArrowRight, Check, KeyRound, Clock, HeartHandshake
} from 'lucide-react'
import { membrosUrl } from '../lib/appUrl'

export default function ParaIgrejas() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px', color: '#0f172a' }}>
      {/* HERO SECTION */}
      <section style={{ textAlign: 'center', maxWidth: 840, margin: '0 auto 64px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(22, 163, 74, 0.1)', color: '#15803d',
          padding: '8px 18px', borderRadius: 999, fontSize: 13, fontWeight: 700,
          marginBottom: 20
        }}>
          <Sparkles size={16} /> Para Ministérios Infantis, EBD e Igrejas
        </div>

        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: 900,
          lineHeight: 1.15,
          color: '#0f172a',
          letterSpacing: '-0.03em',
          marginBottom: 20
        }}>
          Segurança, check-in e conteúdo bíblico de excelência para sua igreja
        </h1>

        <p style={{
          fontSize: 'clamp(16px, 2.5vw, 19px)',
          color: '#475569',
          lineHeight: 1.6,
          marginBottom: 32
        }}>
          A solução completa para organizar o culto infantil e a Escola Bíblica: check-in com crachá e QR Code, fila de retirada segura com validação de responsáveis, gestão de turmas e equipe de professores.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
          <Link
            to="/planos"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#15803d', color: '#fff', padding: '14px 28px',
              borderRadius: 12, fontWeight: 800, fontSize: 16,
              boxShadow: '0 6px 20px rgba(21, 128, 61, 0.25)'
            }}
          >
            <span>CONHECER O PLANO IGREJA</span>
            <ArrowRight size={18} />
          </Link>

          <a
            href={membrosUrl}
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#f8fafc', color: '#334155', padding: '14px 24px',
              borderRadius: 12, fontWeight: 700, fontSize: 15,
              border: '1px solid #e2e8f0'
            }}
          >
            <Church size={18} /> Painel do Ministério Infantil
          </a>
        </div>
      </section>

      {/* RECURSOS MINISTÉRIO INFANTIL */}
      <section style={{ marginBottom: 72 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
            Tranquilidade para os pais, organização para a liderança
          </h2>
          <p style={{ fontSize: 15, color: '#64748b', margin: 0 }}>
            Tudo o que sua comunidade precisa para acolher as crianças no domingo com profissionalismo e amor cristão.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #e2e8f0' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <QrCode size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Check-in Ágil com Crachá & QR</h3>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Recepção rápida na chegada do culto: imprima ou escaneie o crachá da criança na entrada da sala em poucos segundos.
            </p>
          </div>

          <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #e2e8f0' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Retirada Segura Supervisionada</h3>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Apenas os responsáveis cadastrados com senha PIN autorizada podem retirar a criança no término do culto.
            </p>
          </div>

          <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #e2e8f0' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Users size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Turmas Divididas por Faixa Etária</h3>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Organize salas de Berçário, Maternal, Primários e Juniores, atribuindo professores e voluntários dedicados.
            </p>
          </div>

          <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #e2e8f0' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <HeartHandshake size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Equipe de Voluntários & Escala</h3>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Permita que múltiplos líderes e voluntários acessem o sistema com permissões controladas pelo ministério.
            </p>
          </div>

          <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #e2e8f0' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fce7f3', color: '#be185d', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <BookOpen size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Lições & Vídeos Projetáveis</h3>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Transmita historinhas bíblicas em alta definição diretamente no projetor ou TV da sala durante o culto.
            </p>
          </div>

          <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #e2e8f0' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f3e8ff', color: '#6d28d9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <KeyRound size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Prontuário de Cuidados & Alergias</h3>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Registro de restrições alimentares, alergias e observações médicas especiais visíveis no crachá da criança.
            </p>
          </div>
        </div>
      </section>

      {/* PLANO IGREJA EM DESTAQUE */}
      <section style={{
        background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
        borderRadius: 24,
        padding: '48px 32px',
        maxWidth: 760,
        margin: '0 auto',
        textAlign: 'center',
        border: '1px solid #bbf7d0'
      }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#15803d', letterSpacing: '0.05em', marginBottom: 8 }}>
          MAIS ESCOLHIDO POR MINISTÉRIOS
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: '#14532d', margin: '0 0 12px' }}>
          Com Deus Kids Igreja / EBD
        </h2>
        <p style={{ fontSize: 15, color: '#166534', marginBottom: 24 }}>
          Tudo o que sua congregação precisa para cuidar das crianças com segurança e discipulado bíblico.
        </p>

        <div style={{ fontSize: 36, fontWeight: 900, color: '#15803d', marginBottom: 20 }}>
          R$ 99,00 <span style={{ fontSize: 16, fontWeight: 600, color: '#166534' }}>/ mês</span>
          <div style={{ fontSize: 13, color: '#166534', fontWeight: 500, marginTop: 4 }}>
            ou R$ 990,00 no plano anual
          </div>
        </div>

        <ul style={{
          listStyle: 'none', padding: 0, margin: '0 auto 28px', maxWidth: 440,
          textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 10
        }}>
          <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
            <Check size={18} color="#16a34a" /> Tudo do Plano Professor incluído
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
            <Check size={18} color="#16a34a" /> Gestão de até 200 crianças e seus respectivos responsáveis
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
            <Check size={18} color="#16a34a" /> Check-in ágil com crachá e QR Code com PIN parental
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
            <Check size={18} color="#16a34a" /> Fila de retirada supervisionada e controle de equipe voluntária
          </li>
        </ul>

        <Link
          to="/planos"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#15803d', color: '#fff', padding: '14px 32px',
            borderRadius: 12, fontWeight: 800, fontSize: 16,
            boxShadow: '0 6px 20px rgba(21, 128, 61, 0.25)'
          }}
        >
          <span>ASSINAR PLANO IGREJA</span>
          <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  )
}
