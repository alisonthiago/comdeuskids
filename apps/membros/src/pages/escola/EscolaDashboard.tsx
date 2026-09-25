import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useSchool } from '../../hooks/useSchool'
import { supabase } from '@comdeuskids/supabase'

export function EscolaDashboard() {
  const { currentSchool, stats } = useSchool()
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])

  useEffect(() => {
    async function loadEvents() {
      if (!currentSchool) return
      const { data } = await supabase
        .from('school_calendar_events')
        .select('*')
        .eq('school_id', currentSchool.id)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(5)
      setUpcomingEvents(data || [])
    }
    loadEvents()
  }, [currentSchool])

  return (
    <div>
      <h1>Gestão Escolar</h1>
      <p>{currentSchool ? currentSchool.name : 'Selecione uma escola.'}</p>

      {currentSchool && (
        <div>
          <p>Alunos matriculados: {stats?.totalStudents || 0}</p>
          <p>Turmas letivas: {stats?.totalClasses || 0}</p>
          <p>Professores: {stats?.totalTeachers || 0}</p>
        </div>
      )}

      <nav>
        <ul>
          <li><Link to="/escola/alunos">Alunos e Matrículas</Link></li>
          <li><Link to="/escola/professores">Equipe Docente e Monitores</Link></li>
          <li><Link to="/escola/turmas">Turmas e Séries</Link></li>
          <li><Link to="/escola/aulas">Plano Curricular e Aulas</Link></li>
          <li><Link to="/escola/atividades">Atividades e Correções</Link></li>
          <li><Link to="/escola/agenda">Calendário e Eventos</Link></li>
          <li><Link to="/escola/transporte">Transporte e Rotas</Link></li>
          <li><Link to="/escola/comunicacao">Mural de Avisos</Link></li>
          <li><Link to="/escola/configuracoes">Configurações da Escola</Link></li>
        </ul>
      </nav>

      {upcomingEvents.length > 0 && (
        <div>
          <h2>Próximos Eventos</h2>
          <ul>
            {upcomingEvents.map(e => (
              <li key={e.id}>{e.title} - {new Date(e.event_date).toLocaleDateString()}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default EscolaDashboard
