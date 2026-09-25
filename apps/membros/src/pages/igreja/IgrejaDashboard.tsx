import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useChurch } from '../../hooks/useChurch'
import { supabase } from '@comdeuskids/supabase'

export function IgrejaDashboard() {
  const { currentChurch, stats, loading } = useChurch()
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([])

  useEffect(() => {
    async function loadEvents() {
      if (!currentChurch) return
      const { data } = await supabase
        .from('church_events')
        .select('*')
        .eq('organization_id', currentChurch.id)
        .gte('event_date', new Date().toISOString())
        .order('event_date', { ascending: true })
        .limit(5)
      setUpcomingEvents(data || [])
    }
    loadEvents()
  }, [currentChurch])

  if (loading) return <div>Carregando...</div>

  return (
    <div>
      <h1>Ministério Infantil (Igreja)</h1>
      <p>{currentChurch ? currentChurch.name : 'Selecione uma igreja.'}</p>

      {currentChurch && (
        <div>
          <p>Crianças cadastradas: {stats?.totalKids || 0}</p>
          <p>Turmas EBD: {stats?.totalClasses || 0}</p>
          <p>Voluntários: {stats?.totalTeam || 0}</p>
        </div>
      )}

      <nav>
        <ul>
          <li><Link to="/igreja/modo-domingo">Modo Domingo (Ao Vivo)</Link></li>
          <li><Link to="/igreja/checkin">Check-in de Crianças</Link></li>
          <li><Link to="/igreja/retirada">Retirada Segura com PIN</Link></li>
          <li><Link to="/igreja/criancas">Lista de Crianças</Link></li>
          <li><Link to="/igreja/turmas">Salas e Turmas</Link></li>
          <li><Link to="/igreja/equipe">Equipe e Voluntários</Link></li>
          <li><Link to="/igreja/responsaveis">Responsáveis Autorizados</Link></li>
          <li><Link to="/igreja/agenda">Agenda e Eventos</Link></li>
          <li><Link to="/igreja/comunicacao">Comunicação e Avisos</Link></li>
          <li><Link to="/igreja/configuracoes">Configurações da Igreja</Link></li>
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

export default IgrejaDashboard
