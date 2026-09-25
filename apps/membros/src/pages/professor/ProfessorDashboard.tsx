import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@comdeuskids/supabase'
import { useAuth } from '../../hooks/useAuth'

export function ProfessorDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    totalAulas: 0,
    totalTurmas: 0,
    totalAlunos: 0,
    totalEntregas: 0
  })
  const [classes, setClasses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadStats() {
      if (!user) return
      setLoading(true)

      const { data: classList } = await supabase
        .from('educational_classes')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })

      setClasses(classList || [])
      const classCount = classList?.length || 0

      const { data: lessons } = await supabase
        .from('educational_lessons')
        .select('*')
        .eq('created_by', user.id)

      const lessonCount = lessons?.length || 0

      const { count: submissionCount } = await supabase
        .from('educational_submissions')
        .select('*', { count: 'exact', head: true })

      setStats({
        totalAulas: lessonCount,
        totalTurmas: classCount,
        totalAlunos: classCount * 12,
        totalEntregas: submissionCount || 0
      })
      setLoading(false)
    }
    loadStats()
  }, [user])

  if (loading) return <div>Carregando...</div>

  return (
    <div>
      <h1>Painel do Professor</h1>
      <p>Gestão pedagógica e plano de aulas.</p>

      <div>
        <p>Aulas criadas: {stats.totalAulas}</p>
        <p>Turmas ativas: {stats.totalTurmas}</p>
        <p>Entregas recebidas: {stats.totalEntregas}</p>
      </div>

      <nav>
        <ul>
          <li><Link to="/professor/aulas">Criador de Lições (Lesson Builder)</Link></li>
          <li><Link to="/professor/turmas">Gestão de Turmas e Alunos</Link></li>
          <li><Link to="/professor/entregas">Entregas e Correções</Link></li>
          <li><Link to="/professor/diario">Diário e Calendário</Link></li>
          <li><Link to="/professor/materiais">Biblioteca de Materiais</Link></li>
          <li><Link to="/professor/aulas/modo">Modo Apresentação (TV / Projetor)</Link></li>
          <li><Link to="/professor/qr">QR Code de Conexão Rápida</Link></li>
        </ul>
      </nav>

      {classes.length > 0 && (
        <div>
          <h2>Turmas</h2>
          <ul>
            {classes.map(c => (
              <li key={c.id}>{c.name} ({c.grade_level || 'Livre'})</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default ProfessorDashboard
