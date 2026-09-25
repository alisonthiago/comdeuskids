import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/Layout'
import { ChildModeProtection } from './components/ChildModeProtection'

// Contexto Família
import { MinhaFamilia } from './pages/familia/MinhaFamilia'
import { ControlesParentais } from './pages/familia/ControlesParentais'
import { Dispositivos } from './pages/familia/Dispositivos'
import { Assinatura } from './pages/familia/Assinatura'

// Contexto Professor (Motor Educacional)
import { ProfessorDashboard } from './pages/professor/ProfessorDashboard'
import { LessonBuilder } from './pages/professor/LessonBuilder'
import { TurmasAlunos } from './pages/professor/TurmasAlunos'
import { EntregasCorrecoes } from './pages/professor/EntregasCorrecoes'
import { DiarioCalendario } from './pages/professor/DiarioCalendario'
import { MateriaisBiblioteca } from './pages/professor/MateriaisBiblioteca'
import { ModoAula } from './pages/professor/ModoAula'
import { QRCodeFullscreen } from './pages/professor/QRCodeFullscreen'

// Contexto Igreja (Fase 4 - Ministério Infantil & EBD)
import { IgrejaDashboard } from './pages/igreja/IgrejaDashboard'
import { ModoDomingo } from './pages/igreja/ModoDomingo'
import { CriancasIgreja } from './pages/igreja/CriancasIgreja'
import { ResponsaveisIgreja } from './pages/igreja/ResponsaveisIgreja'
import { EquipeIgreja } from './pages/igreja/EquipeIgreja'
import { TurmasIgreja } from './pages/igreja/TurmasIgreja'
import { AulasIgreja } from './pages/igreja/AulasIgreja'
import { AgendaIgreja } from './pages/igreja/AgendaIgreja'
import { CheckinIgreja } from './pages/igreja/CheckinIgreja'
import { RetiradaIgreja } from './pages/igreja/RetiradaIgreja'
import { ComunicacaoIgreja } from './pages/igreja/ComunicacaoIgreja'
import { ConfiguracoesIgreja } from './pages/igreja/ConfiguracoesIgreja'

// Contexto Escola (Fase 5 - Gestão Educacional)
import { EscolaDashboard } from './pages/escola/EscolaDashboard'
import { AlunosEscola } from './pages/escola/AlunosEscola'
import { ResponsaveisEscola } from './pages/escola/ResponsaveisEscola'
import { EquipeEscola } from './pages/escola/EquipeEscola'
import { TurmasEscola } from './pages/escola/TurmasEscola'
import { AulasEscola } from './pages/escola/AulasEscola'
import { AtividadesEscola } from './pages/escola/AtividadesEscola'
import { AgendaEscola } from './pages/escola/AgendaEscola'
import { TransporteEscola } from './pages/escola/TransporteEscola'
import { ComunicacaoEscola } from './pages/escola/ComunicacaoEscola'
import { ConfiguracoesEscola } from './pages/escola/ConfiguracoesEscola'

// Sala de Aula do Aluno (Acesso Individual via Código)
import { AlunoAulaView } from './pages/aluno/AlunoAulaView'
import { PrimeiroAcesso } from './pages/familia/PrimeiroAcesso'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota do Aluno / Sala de Aula Interativa (Acesso por Código ou Link Compartilhado) */}
        <Route path="/aula/:code" element={<AlunoAulaView />} />

        {/* Onboarding Oficial Fullscreen */}
        <Route path="/primeiro-acesso" element={<PrimeiroAcesso />} />
        <Route path="/onboarding" element={<PrimeiroAcesso />} />
        <Route path="/novo-layout/onboarding-primeiro-acesso" element={<PrimeiroAcesso />} />

        {/* Rotas Autenticadas da Área de Membros protegidas contra evasão infantil */}
        <Route
          element={
            <ChildModeProtection>
              <Layout />
            </ChildModeProtection>
          }
        >
          {/* Família */}
          <Route path="/familia" element={<MinhaFamilia />} />
          <Route path="/familia/controles" element={<ControlesParentais />} />
          <Route path="/familia/dispositivos" element={<Dispositivos />} />
          <Route path="/familia/assinatura" element={<Assinatura />} />

          {/* Professor */}
          <Route path="/professor" element={<ProfessorDashboard />} />
          <Route path="/professor/aulas" element={<LessonBuilder />} />
          <Route path="/professor/turmas" element={<TurmasAlunos />} />
          <Route path="/professor/entregas" element={<EntregasCorrecoes />} />
          <Route path="/professor/diario" element={<DiarioCalendario />} />
          <Route path="/professor/calendario" element={<DiarioCalendario />} />
          <Route path="/professor/materiais" element={<MateriaisBiblioteca />} />
          <Route path="/professor/aulas/modo" element={<ModoAula />} />
          <Route path="/professor/qr" element={<QRCodeFullscreen />} />

          {/* Igreja / Ministério Infantil / EBD (Fase 4) */}
          <Route path="/igreja" element={<IgrejaDashboard />} />
          <Route path="/igreja/modo-domingo" element={<ModoDomingo />} />
          <Route path="/igreja/criancas" element={<CriancasIgreja />} />
          <Route path="/igreja/responsaveis" element={<ResponsaveisIgreja />} />
          <Route path="/igreja/equipe" element={<EquipeIgreja />} />
          <Route path="/igreja/turmas" element={<TurmasIgreja />} />
          <Route path="/igreja/classes" element={<TurmasIgreja />} />
          <Route path="/igreja/aulas" element={<AulasIgreja />} />
          <Route path="/igreja/agenda" element={<AgendaIgreja />} />
          <Route path="/igreja/checkin" element={<CheckinIgreja />} />
          <Route path="/igreja/retirada" element={<RetiradaIgreja />} />
          <Route path="/igreja/comunicacao" element={<ComunicacaoIgreja />} />
          <Route path="/igreja/configuracoes" element={<ConfiguracoesIgreja />} />

          {/* Escola / Gestão Educacional (Fase 5) */}
          <Route path="/escola" element={<EscolaDashboard />} />
          <Route path="/escola/alunos" element={<AlunosEscola />} />
          <Route path="/escola/responsaveis" element={<ResponsaveisEscola />} />
          <Route path="/escola/equipe" element={<EquipeEscola />} />
          <Route path="/escola/professores" element={<EquipeEscola />} />
          <Route path="/escola/turmas" element={<TurmasEscola />} />
          <Route path="/escola/aulas" element={<AulasEscola />} />
          <Route path="/escola/atividades" element={<AtividadesEscola />} />
          <Route path="/escola/agenda" element={<AgendaEscola />} />
          <Route path="/escola/transporte" element={<TransporteEscola />} />
          <Route path="/escola/comunicacao" element={<ComunicacaoEscola />} />
          <Route path="/escola/configuracoes" element={<ConfiguracoesEscola />} />

          {/* Redirecionamentos padrão */}
          <Route path="/" element={<Navigate to="/familia" replace />} />
          <Route path="*" element={<Navigate to="/familia" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
