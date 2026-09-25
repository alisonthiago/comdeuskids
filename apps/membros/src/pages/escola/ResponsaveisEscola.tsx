import React, { useState, useEffect } from 'react'
import {
  Users,
  Search,
  Phone,
  ShieldCheck,
  Plus,
  X,
  CheckCircle,
  GraduationCap
} from 'lucide-react'
import { useSchool } from '../../hooks/useSchool'
import { supabase } from '@comdeuskids/supabase'

export function ResponsaveisEscola() {
  const { currentSchool, hasCapability } = useSchool()
  const [guardians, setGuardians] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    loadGuardians()
  }, [currentSchool])

  const loadGuardians = async () => {
    if (!currentSchool) return
    setLoading(true)
    try {
      // 1. Carregar alunos da escola e seus responsáveis vinculados via child_guardians
      const { data } = await supabase
        .from('organization_students')
        .select(`
          child_id,
          enrollment_code,
          child:children (
            id,
            first_name,
            last_name,
            guardians:child_guardians (
              kinship,
              is_primary,
              can_pickup,
              guardian:guardians (
                id,
                full_name,
                phone,
                email
              )
            )
          )
        `)
        .eq('organization_id', currentSchool.id)

      if (data) {
        const flatList: any[] = []
        data.forEach((st: any) => {
          if (st.child?.guardians && st.child.guardians.length > 0) {
            st.child.guardians.forEach((cg: any) => {
              if (cg.guardian) {
                flatList.push({
                  guardianName: cg.guardian.full_name,
                  phone: cg.guardian.phone,
                  email: cg.guardian.email,
                  kinship: cg.kinship,
                  canPickup: cg.can_pickup,
                  studentName: `${st.child.first_name} ${st.child.last_name || ''}`.trim(),
                  enrollmentCode: st.enrollment_code
                })
              }
            })
          }
        })
        setGuardians(flatList)
      }
    } catch (err) {
      console.warn('Erro ao carregar responsáveis da escola:', err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = guardians.filter((g) => {
    const text = `${g.guardianName} ${g.studentName} ${g.enrollmentCode}`.toLowerCase()
    return text.includes(searchTerm.toLowerCase())
  })

  return (
    <div className="s-page">
      <div className="s-header">
        <div>
          <span className="s-badge s-badge--primary" style={{ marginBottom: 6 }}>Famílias & Comunicação</span>
          <h1 className="s-title">
            Responsáveis & Contatos de Alunos
          </h1>
          <p className="s-subtitle">
            Listagem de pais, responsáveis legais e contatos de emergência vinculados aos alunos matriculados na escola.
          </p>
        </div>
      </div>

      {/* Busca */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <Search size={18} color="var(--s-neutral-variant)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
        <input
          type="text"
          placeholder="Buscar por responsável, nome do aluno ou matrícula..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="s-input"
          style={{ paddingLeft: 46 }}
        />
      </div>

      <div className="s-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 48, textAlign: 'center', color: 'var(--s-neutral-variant)', fontSize: 14 }}>
            Carregando responsáveis...
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: 56, textAlign: 'center' }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--s-surface-variant)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 12
            }}>
              <Users size={28} color="var(--s-primary)" />
            </div>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--s-neutral)', margin: '0 0 6px 0' }}>
              Nenhum responsável encontrado
            </h3>
            <p style={{ color: 'var(--s-neutral-variant)', fontSize: 13, margin: 0 }}>
              Os responsáveis são vinculados automaticamente durante a matrícula dos alunos.
            </p>
          </div>
        ) : (
          <div className="s-table-container" style={{ margin: 0 }}>
            <table className="s-table">
              <thead>
                <tr>
                  <th>Responsável</th>
                  <th>Parentesco</th>
                  <th>Aluno Vinculado</th>
                  <th>Matrícula</th>
                  <th>Retirada</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((g, idx) => (
                  <tr key={idx}>
                    <td>
                      <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--s-neutral)', display: 'block' }}>
                        {g.guardianName}
                      </span>
                      {g.phone && <span style={{ fontSize: 12, color: 'var(--s-neutral-variant)' }}>{g.phone}</span>}
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--s-neutral)' }}>
                      {g.kinship}
                    </td>
                    <td style={{ fontSize: 13, color: 'var(--s-primary)', fontWeight: 700 }}>
                      {g.studentName}
                    </td>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 800, color: 'var(--s-neutral)' }}>
                        {g.enrollmentCode}
                      </span>
                    </td>
                    <td>
                      <span className={`s-badge ${g.canPickup ? 's-badge--emerald' : 's-badge--neutral'}`}>
                        {g.canPickup ? 'AUTORIZADO' : 'NÃO AUTORIZADO'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
