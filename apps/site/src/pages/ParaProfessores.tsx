import React from 'react'
import { Link } from 'react-router-dom'
import {
  BookOpen, Users, CheckSquare, Award, Sparkles, ArrowRight,
  FileText, Palette, BarChart3, Tv, Check
} from 'lucide-react'
import { membrosUrl } from '../lib/appUrl'

export default function ParaProfessores() {
  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '48px 24px', color: '#0f172a' }}>
      {/* HERO SECTION */}
      <section style={{ textAlign: 'center', maxWidth: 840, margin: '0 auto 64px' }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(217, 119, 6, 0.1)', color: '#b45309',
          padding: '8px 18px', borderRadius: 999, fontSize: 13, fontWeight: 700,
          marginBottom: 20
        }}>
          <Sparkles size={16} /> Para Educadores e Professores de EBD
        </div>

        <h1 style={{
          fontSize: 'clamp(32px, 5vw, 48px)',
          fontWeight: 900,
          lineHeight: 1.15,
          color: '#0f172a',
          letterSpacing: '-0.03em',
          marginBottom: 20
        }}>
          Aulas bíblicas dinâmicas, materiais prontos e gestão da sua turma
        </h1>

        <p style={{
          fontSize: 'clamp(16px, 2.5vw, 19px)',
          color: '#475569',
          lineHeight: 1.6,
          marginBottom: 32
        }}>
          O motor educacional do Com Deus Kids oferece o Lesson Builder para criar lições, quizzes interativos, atividades de pintura e acompanhamento em tempo real dos seus alunos.
        </p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap' }}>
          <Link
            to="/planos"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#b45309', color: '#fff', padding: '14px 28px',
              borderRadius: 12, fontWeight: 800, fontSize: 16,
              boxShadow: '0 6px 20px rgba(180, 83, 9, 0.25)'
            }}
          >
            <span>ASSINAR PLANO PROFESSOR</span>
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
            <BookOpen size={18} /> Acessar Área do Professor
          </a>
        </div>
      </section>

      {/* RECURSOS PEDAGÓGICOS */}
      <section style={{ marginBottom: 72 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: '#0f172a', margin: '0 0 8px' }}>
            Recursos construídos para o educador cristão
          </h2>
          <p style={{ fontSize: 15, color: '#64748b', margin: 0 }}>
            Economize horas de preparação semanal com ferramentas didáticas integradas ao catálogo.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #e2e8f0' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <BookOpen size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Lesson Builder Intuitivo</h3>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Crie roteiros de aula completos conectando vídeos da plataforma, versículos bíblicos de memorização, devocionais e objetivos didáticos.
            </p>
          </div>

          <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #e2e8f0' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ede9fe', color: '#7c3aed', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Users size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Turmas e Alunos Simplificados</h3>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Cadastre suas turmas e gere códigos curtos de 6 dígitos para que as crianças entrem facilmente sem precisar de e-mail ou senha complexa.
            </p>
          </div>

          <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #e2e8f0' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <CheckSquare size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Quizzes e Atividades Interativas</h3>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Fixe o aprendizado com perguntas sobre a lição bíblica, feedback explicativo e pontuação divertida para os alunos.
            </p>
          </div>

          <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #e2e8f0' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fce7f3', color: '#be185d', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <Palette size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Desenhos para Colorir e Pintura</h3>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Disponibilize atividades de pintura na tela do computador/tablet e imprima versões em PDF para fazer em sala de aula.
            </p>
          </div>

          <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #e2e8f0' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#e0f2fe', color: '#0369a1', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <BarChart3 size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Diário de Bordo & Resultados</h3>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Acompanhe a frequência das crianças, quem realizou as lições da semana e o progresso espiritual de cada pequeno aprendiz.
            </p>
          </div>

          <div style={{ background: '#fff', borderRadius: 20, padding: 28, border: '1px solid #e2e8f0' }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: '#f3e8ff', color: '#6d28d9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
              <FileText size={24} />
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Biblioteca de Apoio Pedagógico</h3>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              Acesse guias do professor, visuais ilustrados e roteiros com perguntas práticas para enriquecer cada encontro.
            </p>
          </div>
        </div>
      </section>

      {/* PLANO PROFESSOR EM DESTAQUE */}
      <section style={{
        background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
        borderRadius: 24,
        padding: '48px 32px',
        maxWidth: 760,
        margin: '0 auto',
        textAlign: 'center',
        border: '1px solid #fde68a'
      }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: '#b45309', letterSpacing: '0.05em', marginBottom: 8 }}>
          PLANO PARA EDUCADORES
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 900, color: '#451a03', margin: '0 0 12px' }}>
          Com Deus Kids Professor Individual
        </h2>
        <p style={{ fontSize: 15, color: '#78350f', marginBottom: 24 }}>
          A ferramenta ideal para professores de Escola Bíblica, ministério infantil e evangelistas de crianças.
        </p>

        <div style={{ fontSize: 36, fontWeight: 900, color: '#b45309', marginBottom: 20 }}>
          R$ 39,90 <span style={{ fontSize: 16, fontWeight: 600, color: '#92400e' }}>/ mês</span>
          <div style={{ fontSize: 13, color: '#92400e', fontWeight: 500, marginTop: 4 }}>
            ou R$ 399,00 no plano anual
          </div>
        </div>

        <ul style={{
          listStyle: 'none', padding: 0, margin: '0 auto 28px', maxWidth: 420,
          textAlign: 'left', display: 'flex', flexDirection: 'column', gap: 10
        }}>
          <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
            <Check size={18} color="#16a34a" /> Acesso a todo o conteúdo e vídeos do streaming
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
            <Check size={18} color="#16a34a" /> Motor pedagógico completo com Lesson Builder
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
            <Check size={18} color="#16a34a" /> Até 50 alunos cadastrados com login por código de 6 dígitos
          </li>
          <li style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
            <Check size={18} color="#16a34a" /> Quizzes, correção de tarefas e diário da turma
          </li>
        </ul>

        <Link
          to="/planos"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#b45309', color: '#fff', padding: '14px 32px',
            borderRadius: 12, fontWeight: 800, fontSize: 16,
            boxShadow: '0 6px 20px rgba(180, 83, 9, 0.25)'
          }}
        >
          <span>ASSINAR PLANO PROFESSOR</span>
          <ArrowRight size={18} />
        </Link>
      </section>
    </div>
  )
}
