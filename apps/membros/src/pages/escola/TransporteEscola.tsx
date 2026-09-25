import React, { useState, useEffect } from 'react'
import {
  Bus,
  Users,
  Plus,
  Search,
  ShieldCheck,
  Phone,
  Clock,
  Calendar,
  Layers,
  MapPin,
  CheckCircle2,
  X,
  AlertTriangle,
  UserCheck
} from 'lucide-react'
import { useSchool } from '../../hooks/useSchool'
import { supabase } from '@comdeuskids/supabase'

export function TransporteEscola() {
  const { currentSchool, hasCapability, refreshStats } = useSchool()
  const [activeTab, setActiveTab] = useState<'routes' | 'students' | 'vehicles' | 'people'>('routes')

  // Listas
  const [routes, setRoutes] = useState<any[]>([])
  const [transportStudents, setTransportStudents] = useState<any[]>([])
  const [vehicles, setVehicles] = useState<any[]>([])
  const [people, setPeople] = useState<any[]>([])
  const [schoolStudents, setSchoolStudents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Modais
  const [modalNewRoute, setModalNewRoute] = useState(false)
  const [modalAssignStudent, setModalAssignStudent] = useState(false)
  const [modalNewVehicle, setModalNewVehicle] = useState(false)
  const [modalNewPerson, setModalNewPerson] = useState(false)

  // Form states rota
  const [routeName, setRouteName] = useState('')
  const [shift, setShift] = useState<'morning' | 'afternoon' | 'night' | 'full_time'>('morning')

  // Form states aluno no transporte
  const [selectedChildId, setSelectedChildId] = useState('')
  const [selectedRouteId, setSelectedRouteId] = useState('')

  // Form states veículo
  const [vehicleIden, setVehicleIden] = useState('')
  const [plate, setPlate] = useState('')
  const [capacity, setCapacity] = useState('16')

  // Form states motorista/monitor
  const [personName, setPersonName] = useState('')
  const [personType, setPersonType] = useState<'driver' | 'monitor'>('driver')
  const [personPhone, setPersonPhone] = useState('')

  const [saving, setSaving] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    loadTransportData()
  }, [currentSchool])

  const loadTransportData = async () => {
    if (!currentSchool) return
    setLoading(true)
    try {
      const { data: rts } = await supabase
        .from('school_transport_routes')
        .select('*')
        .eq('organization_id', currentSchool.id)
        .order('created_at', { ascending: true })

      if (rts) setRoutes(rts)

      const { data: stds } = await supabase
        .from('school_transport_assignments')
        .select(`
          id,
          route_id,
          child_id,
          status,
          start_date,
          child:children (first_name, last_name),
          route:school_transport_routes (name, shift)
        `)
        .eq('organization_id', currentSchool.id)

      if (stds) setTransportStudents(stds)

      const { data: vh } = await supabase
        .from('school_transport_vehicles')
        .select('*')
        .eq('organization_id', currentSchool.id)

      if (vh) setVehicles(vh)

      const { data: ppl } = await supabase
        .from('school_transport_people')
        .select('*')
        .eq('organization_id', currentSchool.id)

      if (ppl) setPeople(ppl)

      const { data: orgStds } = await supabase
        .from('organization_students')
        .select(`
          child_id,
          enrollment_code,
          child:children (id, first_name, last_name)
        `)
        .eq('organization_id', currentSchool.id)
        .eq('status', 'active')

      if (orgStds) setSchoolStudents(orgStds)
    } catch (err) {
      console.warn('Erro ao carregar dados de transporte:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRoute = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentSchool || !routeName.trim()) return
    setSaving(true)
    setFeedback(null)
    try {
      const { error } = await supabase.from('school_transport_routes').insert({
        organization_id: currentSchool.id,
        name: routeName.trim(),
        shift,
        status: 'active'
      })
      if (error) throw error
      setFeedback('Rota de transporte cadastrada com sucesso!')
      setModalNewRoute(false)
      setRouteName('')
      await loadTransportData()
      await refreshStats()
    } catch (err: any) {
      setFeedback(`Erro ao salvar rota: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleAssignStudent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentSchool || !selectedChildId || !selectedRouteId) return
    setSaving(true)
    setFeedback(null)
    try {
      const { data: userData } = await supabase.auth.getUser()
      const userId = userData?.user?.id
      if (!userId) throw new Error('Não autenticado')

      const { error } = await supabase.from('school_transport_assignments').insert({
        organization_id: currentSchool.id,
        route_id: selectedRouteId,
        child_id: selectedChildId,
        status: 'active',
        created_by: userId
      })
      if (error) throw error
      setFeedback('Aluno autorizado no transporte com sucesso!')
      setModalAssignStudent(false)
      setSelectedChildId('')
      setSelectedRouteId('')
      await loadTransportData()
      await refreshStats()
    } catch (err: any) {
      setFeedback(`Erro ao autorizar aluno: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleCreateVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentSchool || !vehicleIden.trim() || !plate.trim()) return
    setSaving(true)
    setFeedback(null)
    try {
      const { error } = await supabase.from('school_transport_vehicles').insert({
        organization_id: currentSchool.id,
        identification: vehicleIden.trim(),
        plate: plate.trim().toUpperCase(),
        capacity: parseInt(capacity) || 16,
        status: 'active'
      })
      if (error) throw error
      setFeedback('Veículo cadastrado na frota escolar!')
      setModalNewVehicle(false)
      setVehicleIden('')
      setPlate('')
      await loadTransportData()
    } catch (err: any) {
      setFeedback(`Erro ao salvar veículo: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const handleCreatePerson = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!currentSchool || !personName.trim()) return
    setSaving(true)
    setFeedback(null)
    try {
      const { error } = await supabase.from('school_transport_people').insert({
        organization_id: currentSchool.id,
        full_name: personName.trim(),
        person_type: personType,
        phone: personPhone.trim() || null,
        status: 'active'
      })
      if (error) throw error
      setFeedback('Profissional de transporte cadastrado com sucesso!')
      setModalNewPerson(false)
      setPersonName('')
      setPersonPhone('')
      await loadTransportData()
    } catch (err: any) {
      setFeedback(`Erro ao salvar profissional: ${err.message}`)
    } finally {
      setSaving(false)
    }
  }

  const shiftLabels: Record<string, string> = {
    morning: 'Manhã',
    afternoon: 'Tarde',
    night: 'Noite',
    full_time: 'Integral'
  }

  return (
    <div className="s-page" style={{ padding: '0 0 60px 0' }}>
      {/* Top Header */}
      <section className="s-card" style={{ padding: '24px 28px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="s-badge s-badge--emerald">
                <Bus size={12} /> LOGÍSTICA & FROTAS
              </span>
              <span style={{ fontSize: '13px', color: 'var(--s-text-muted)' }}>
                • {currentSchool?.name}
              </span>
            </div>
            <h1 style={{ fontSize: '26px', fontWeight: 800, color: 'var(--s-text)', margin: '0 0 4px 0', letterSpacing: '-0.02em' }}>
              Transporte Escolar • Saída Assistida
            </h1>
            <p style={{ color: 'var(--s-text-muted)', fontSize: '14px', margin: 0 }}>
              Gestão de vans, ônibus, rotas por período, motoristas, monitores e alunos autorizados no embarque.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setModalAssignStudent(true)}
              className="s-btn s-btn--primary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <UserCheck size={16} /> Autorizar Aluno no Transporte
            </button>
            <button
              onClick={() => setModalNewRoute(true)}
              className="s-btn s-btn--secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} /> Nova Rota
            </button>
          </div>
        </div>
      </section>

      {feedback && (
        <div
          style={{
            padding: '12px 18px',
            borderRadius: '12px',
            background: 'rgba(0, 108, 73, 0.08)',
            border: '1px solid var(--s-emerald)',
            color: 'var(--s-emerald)',
            fontSize: '14px',
            fontWeight: 600,
            marginBottom: '20px'
          }}
        >
          {feedback}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('routes')}
          className={`s-btn ${activeTab === 'routes' ? 's-btn--primary' : 's-btn--secondary'}`}
          style={{ fontSize: '13px' }}
        >
          Rotas & Períodos ({routes.length})
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`s-btn ${activeTab === 'students' ? 's-btn--primary' : 's-btn--secondary'}`}
          style={{ fontSize: '13px' }}
        >
          Alunos Autorizados ({transportStudents.length})
        </button>
        <button
          onClick={() => setActiveTab('vehicles')}
          className={`s-btn ${activeTab === 'vehicles' ? 's-btn--primary' : 's-btn--secondary'}`}
          style={{ fontSize: '13px' }}
        >
          Veículos & Frota ({vehicles.length})
        </button>
        <button
          onClick={() => setActiveTab('people')}
          className={`s-btn ${activeTab === 'people' ? 's-btn--primary' : 's-btn--secondary'}`}
          style={{ fontSize: '13px' }}
        >
          Motoristas & Monitores ({people.length})
        </button>
      </div>

      {/* Conteúdo da Aba */}
      <section className="s-card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* ABA: ROTAS */}
        {activeTab === 'routes' && (
          <div>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--s-border)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--s-text)', margin: 0 }}>
                Rotas Cadastradas
              </h3>
            </div>
            {routes.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--s-text-muted)' }}>
                Nenhuma rota cadastrada.{' '}
                <button onClick={() => setModalNewRoute(true)} className="s-btn s-btn--ghost" style={{ color: 'var(--s-primary)', fontWeight: 700 }}>
                  Criar rota agora
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {routes.map((r) => (
                  <div key={r.id} style={{ padding: '16px 24px', borderBottom: '1px solid var(--s-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--s-text)', display: 'block' }}>
                        {r.name}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--s-text-muted)' }}>
                        Período: {shiftLabels[r.shift] || r.shift}
                      </span>
                    </div>
                    <span className="s-badge s-badge--emerald">
                      ATIVO
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABA: ALUNOS NO TRANSPORTE */}
        {activeTab === 'students' && (
          <div>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--s-border)' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--s-text)', margin: 0 }}>
                Alunos com Autorização Ativa no Transporte
              </h3>
            </div>
            {transportStudents.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--s-text-muted)' }}>
                Nenhum aluno autorizado no transporte ainda.{' '}
                <button onClick={() => setModalAssignStudent(true)} className="s-btn s-btn--ghost" style={{ color: 'var(--s-primary)', fontWeight: 700 }}>
                  Autorizar primeiro aluno
                </button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--s-border)', background: 'var(--s-surface-container-low)' }}>
                      <th style={{ padding: '14px 20px', fontSize: '12px', color: 'var(--s-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Aluno</th>
                      <th style={{ padding: '14px 20px', fontSize: '12px', color: 'var(--s-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Rota / Período</th>
                      <th style={{ padding: '14px 20px', fontSize: '12px', color: 'var(--s-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Início</th>
                      <th style={{ padding: '14px 20px', fontSize: '12px', color: 'var(--s-text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transportStudents.map((ts) => (
                      <tr key={ts.id} style={{ borderBottom: '1px solid var(--s-border)' }}>
                        <td style={{ padding: '14px 20px', fontSize: '14px', fontWeight: 700, color: 'var(--s-text)' }}>
                          {ts.child?.first_name} {ts.child?.last_name || ''}
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--s-text)' }}>
                          {ts.route?.name} ({shiftLabels[ts.route?.shift] || ts.route?.shift})
                        </td>
                        <td style={{ padding: '14px 20px', fontSize: '13px', color: 'var(--s-text-muted)' }}>
                          {new Date(ts.start_date).toLocaleDateString('pt-BR')}
                        </td>
                        <td style={{ padding: '14px 20px' }}>
                          <span className="s-badge s-badge--emerald">
                            AUTORIZADO
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ABA: VEÍCULOS */}
        {activeTab === 'vehicles' && (
          <div>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--s-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--s-text)', margin: 0 }}>
                Frota de Veículos
              </h3>
              <button onClick={() => setModalNewVehicle(true)} className="s-btn s-btn--secondary" style={{ fontSize: '12px' }}>
                + Adicionar Veículo
              </button>
            </div>
            {vehicles.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--s-text-muted)' }}>
                Nenhum veículo cadastrado na frota.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {vehicles.map((v) => (
                  <div key={v.id} style={{ padding: '16px 24px', borderBottom: '1px solid var(--s-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--s-text)', display: 'block' }}>
                        {v.identification}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--s-text-muted)' }}>
                        Placa: {v.plate} • Capacidade: {v.capacity} lugares
                      </span>
                    </div>
                    <span className="s-badge s-badge--emerald">
                      ATIVO
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ABA: MOTORISTAS & MONITORES */}
        {activeTab === 'people' && (
          <div>
            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--s-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--s-text)', margin: 0 }}>
                Profissionais de Transporte
              </h3>
              <button onClick={() => setModalNewPerson(true)} className="s-btn s-btn--secondary" style={{ fontSize: '12px' }}>
                + Cadastrar Profissional
              </button>
            </div>
            {people.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--s-text-muted)' }}>
                Nenhum motorista ou monitor cadastrado.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {people.map((p) => (
                  <div key={p.id} style={{ padding: '16px 24px', borderBottom: '1px solid var(--s-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: 'var(--s-text)', display: 'block' }}>
                        {p.full_name}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--s-text-muted)' }}>
                        {p.person_type === 'driver' ? 'Motorista Oficial' : 'Monitor(a) de Van'} {p.phone ? `• ${p.phone}` : ''}
                      </span>
                    </div>
                    <span className="s-badge s-badge--emerald">
                      ATIVO
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </section>

      {/* Modal Nova Rota */}
      {modalNewRoute && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div className="s-card" style={{ maxWidth: '440px', width: '100%', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--s-text)', margin: 0 }}>
                Cadastrar Rota de Transporte
              </h2>
              <button onClick={() => setModalNewRoute(false)} style={{ background: 'transparent', border: 'none', color: 'var(--s-text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateRoute} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="s-label" style={{ marginBottom: '6px' }}>Nome da Rota *</label>
                <input
                  type="text"
                  required
                  value={routeName}
                  onChange={(e) => setRouteName(e.target.value)}
                  placeholder="Ex: Rota Centro / Bairro Sul"
                  className="s-input"
                  style={{ width: '100%', height: '42px' }}
                />
              </div>

              <div>
                <label className="s-label" style={{ marginBottom: '6px' }}>Período / Turno</label>
                <select
                  value={shift}
                  onChange={(e: any) => setShift(e.target.value)}
                  className="s-select"
                  style={{ width: '100%', height: '42px' }}
                >
                  <option value="morning">Manhã</option>
                  <option value="afternoon">Tarde</option>
                  <option value="night">Noite</option>
                  <option value="full_time">Integral</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setModalNewRoute(false)}
                  className="s-btn s-btn--secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="s-btn s-btn--primary"
                >
                  {saving ? 'Criando...' : 'Criar Rota'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Autorizar Aluno no Transporte */}
      {modalAssignStudent && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div className="s-card" style={{ maxWidth: '440px', width: '100%', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--s-text)', margin: 0 }}>
                Autorizar Aluno no Transporte
              </h2>
              <button onClick={() => setModalAssignStudent(false)} style={{ background: 'transparent', border: 'none', color: 'var(--s-text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAssignStudent} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="s-label" style={{ marginBottom: '6px' }}>Selecione o Aluno *</label>
                <select
                  required
                  value={selectedChildId}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                  className="s-select"
                  style={{ width: '100%', height: '42px' }}
                >
                  <option value="">Selecione o aluno</option>
                  {schoolStudents.map((st) => (
                    <option key={st.child_id} value={st.child_id}>
                      {st.child?.first_name} {st.child?.last_name || ''} (Matrícula: {st.enrollment_code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="s-label" style={{ marginBottom: '6px' }}>Rota de Transporte *</label>
                <select
                  required
                  value={selectedRouteId}
                  onChange={(e) => setSelectedRouteId(e.target.value)}
                  className="s-select"
                  style={{ width: '100%', height: '42px' }}
                >
                  <option value="">Selecione a rota</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({shiftLabels[r.shift] || r.shift})
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setModalAssignStudent(false)}
                  className="s-btn s-btn--secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="s-btn s-btn--primary"
                >
                  {saving ? 'Autorizando...' : 'Autorizar Aluno'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Novo Veículo */}
      {modalNewVehicle && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div className="s-card" style={{ maxWidth: '440px', width: '100%', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--s-text)', margin: 0 }}>
                Cadastrar Veículo na Frota
              </h2>
              <button onClick={() => setModalNewVehicle(false)} style={{ background: 'transparent', border: 'none', color: 'var(--s-text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateVehicle} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="s-label" style={{ marginBottom: '6px' }}>Identificação da Van / Veículo *</label>
                <input
                  type="text"
                  required
                  value={vehicleIden}
                  onChange={(e) => setVehicleIden(e.target.value)}
                  placeholder="Ex: Van Escolar 02"
                  className="s-input"
                  style={{ width: '100%', height: '42px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="s-label" style={{ marginBottom: '6px' }}>Placa *</label>
                  <input
                    type="text"
                    required
                    value={plate}
                    onChange={(e) => setPlate(e.target.value)}
                    placeholder="ABC1D23"
                    className="s-input"
                    style={{ width: '100%', height: '42px' }}
                  />
                </div>
                <div>
                  <label className="s-label" style={{ marginBottom: '6px' }}>Capacidade (lugares)</label>
                  <input
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    placeholder="16"
                    className="s-input"
                    style={{ width: '100%', height: '42px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setModalNewVehicle(false)}
                  className="s-btn s-btn--secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="s-btn s-btn--primary"
                >
                  {saving ? 'Salvando...' : 'Cadastrar Veículo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Novo Profissional */}
      {modalNewPerson && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, padding: '20px' }}>
          <div className="s-card" style={{ maxWidth: '440px', width: '100%', padding: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--s-text)', margin: 0 }}>
                Cadastrar Profissional de Transporte
              </h2>
              <button onClick={() => setModalNewPerson(false)} style={{ background: 'transparent', border: 'none', color: 'var(--s-text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePerson} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="s-label" style={{ marginBottom: '6px' }}>Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="Ex: Tio Cláudio Motorista"
                  className="s-input"
                  style={{ width: '100%', height: '42px' }}
                />
              </div>

              <div>
                <label className="s-label" style={{ marginBottom: '6px' }}>Função</label>
                <select
                  value={personType}
                  onChange={(e: any) => setPersonType(e.target.value)}
                  className="s-select"
                  style={{ width: '100%', height: '42px' }}
                >
                  <option value="driver">Motorista</option>
                  <option value="monitor">Monitor(a) de Van</option>
                </select>
              </div>

              <div>
                <label className="s-label" style={{ marginBottom: '6px' }}>Telefone / WhatsApp</label>
                <input
                  type="tel"
                  value={personPhone}
                  onChange={(e) => setPersonPhone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className="s-input"
                  style={{ width: '100%', height: '42px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={() => setModalNewPerson(false)}
                  className="s-btn s-btn--secondary"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="s-btn s-btn--primary"
                >
                  {saving ? 'Salvando...' : 'Salvar Profissional'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
