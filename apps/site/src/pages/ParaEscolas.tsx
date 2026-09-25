import React from 'react'
import { Link } from 'react-router-dom'
import {
  GraduationCap, Bus, Users, BookOpen, Sparkles, ArrowRight,
  Check, Calendar, ShieldCheck, FileCheck, Layers
} from 'lucide-react'
import { membrosUrl } from '../lib/appUrl'

export default function ParaEscolas() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px', color: '#0f172a' }}>
      {/* HERO SECTION */}
      <section style={{ textAlign: 'center', maxWidth: 840, margin: '0 auto 64px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(3, 105, 161, 0.1)', color: '#0369a1',
          padding: '8px 18px', borderRadius: 999, fontSize: 13, fontWeight: 700,
          marginBottom: 20
        }}>
          <Sparkles size={16} /> Para Colégios e Escolas de Educação Infantil Cristãs
        </div>

        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: 900,
          lineHeight: 1.15,
          color: '#0f172a',
          letterSpacing: '-0.03em',
          marginBottom: 20
        }}>
          Gestão escolar integrada com valores e princípios bíblicos
        </h1>

        <p style={{
          fontSize: 'clamp(16px, 2.5vw, 19px)',
          color: '#475569',
          lineHeight: 1.6,
          marginBottom: 32
        }}>
          A infraestrutura completa para sua instituição de ensino: matrícula oficial de alunos, equipe pedagógica, turmas, agenda de recados, controle de transporte escolar e catálogo educacional cristão.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
          <Link
            to="/planos"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#0369a1', color: '#fff', padding: '14px 28px',
              borderRadius: 12, fontWeight: 800, fontSize: 16,
              boxShadow: '0 6px 20px rgba(3, 105, 161, 0.25)'
            }}
          >
            <span>CONTRATAR PLANO ESCOLA</span>
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
            <GraduationCap size={18} /> Portal Institucional
          </a>
        </div>
      </section>

      {/* RECURSOS ESCOLARES */}
      <section style={{ marginBottom: 72 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
            Tecnologia de ponta a favor da educação cristã
          </h2>
          <p style={{ fontSize: 15, color: '#64748b', margin: 0 }}>
            Facilite a rotina de diretores, coordenadores pedagógicos, professores e famílias dos estudantes.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #e2e8f0' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Users size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Matrícula & Alunos</h3>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Atribuição automática de código de matrícula de 6 dígitos único por aluno, facilitando o acesso individual dos estudantes.
            </p>
          </div>

          <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #e2e8f0' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Bus size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Gestão de Transporte Escolar</h3>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Cadastro de rotas, vans escolares e motoristas responsáveis, com acompanhamento de embarque e desembarque dos alunos.
            </p>
          </div>

          <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #e2e8f0' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Calendar size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Agenda de Recados & Famílias</h3>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Canal oficial para comunicação de eventos, recados dos professores e comunicados institucionais com os pais.
            </p>
          </div>

          <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #e2e8f0' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <BookOpen size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Conteúdo Curricular Complementar</h3>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Material didático alinhado com princípios bíblicos para enriquecer o plano de ensino das turmas infantis e fundamentais.
            </p>
          </div>

          <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #e2e8f0' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fce7f3', color: '#be185d', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <FileCheck size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Diário de Classe & Notas</h3>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Registro de frequência diária, notas de atividades e relatórios pedagógicos de evolução individual do aluno.
            </p>
          </div>

          <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #e2e8f0' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f3e8ff', color: '#6d28d9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Múltiplos Níveis de Permissão</h3>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Acesso diferenciado para Direção, Coordenação, Professores e Secretaria, mantendo os dados da instituição protegidos.
            </p>
          </div>
        </div>
      </section>

      {/* PLANO ESCOLA EM DESTAQUE */}
      <section style={{
        background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
        borderRadius: 24,
        padding: '48px 32px',
        maxWidth: 760,
        margin: '0 auto',
        textAlign: 'center',
        border: '1px solid #bae6fd'
      }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#0369a1', letterSpacing: '0.05em', marginBottom: 8 }}>
          LICENÇA INSTITUCIONAL
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: '#0c4a6e', margin: '0 0 12px' }}>
          Com Deus Kids Escola Cristã
        </h2>
        <p style={{ fontSize: 15, color: '#0369a1', marginBottom: 24 }}>
          A plataforma completa de apoio pedagógico e gestão para escolas de educação infantil e ensino fundamental.
        </p>

        <div style={{ fontSize: 36, fontWeight: 900, color: '#0369a1', marginBottom: 20 }}>
          R$ 199,00 <span style={{ fontSize: 16, fontWeight: 600, color: '#0c4a6e' }}>/ mês</span>
          <div style={{ fontSize: 13, color: '#0c4a6e', fontWeight: 500, marginTop: 4 }}>
            ou R$ 1.990,00 no plano anual
          </div>
        </div>

        <ul style={{
          listStyle: 'none', padding: 0, margin: '0 auto 28px', maxWidth: 440,
          textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 10
        }}>
          <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
            <Check size={18} color="#16a34a" /> Todos os recursos do Ministério Infantil incluídos
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
            <Check size={18} color="#16a34a" /> Gestão escolar completa para até 500 alunos
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
            <Check size={18} color="#16a34a" /> Matrícula oficial de 6 dígitos única por aluno
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
            <Check size={18} color="#16a34a" /> Gestão de transporte escolar com rotas e motoristas
          </li>
        </ul>

        <Link
          to="/planos"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#0369a1', color: '#fff', padding: '14px 32px',
            borderRadius: 12, fontWeight: 800, fontSize: 16,
            boxShadow: '0 6px 20px rgba(3, 105, 161, 0.25)'
          }}
        >
          <span>CONTRATAR PLANO ESCOLA</span>
          <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  )
}
