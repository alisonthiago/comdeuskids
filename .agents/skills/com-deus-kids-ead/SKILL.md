---
name: com-deus-kids-ead
description: Architecture, data model, and business rules for Com Deus Kids EAD (Curso → Módulo → Aula → Conteúdo → Atividade → Entrega → Progresso → Professor → Turma → Aluno).
---

# Com Deus Kids EAD — Arquitetura Oficial de Ensino Bíblico

Esta Skill documenta a estrutura pedagógica e operacional do Com Deus Kids para Escolas Bíblicas, Igrejas e Educação Cristã em Família.

## 1. Hierarquia de Ensino
A estrutura de aprendizagem segue estritamente a cadeia:
```
Curso / Série Educativa
  └── Módulo / Unidade Temática
        └── Aula / Encontro EBD
              ├── Conteúdo (Vídeo 4K / Animação Bíblica)
              ├── Material Didático (PDF / Guia do Professor)
              ├── Atividade Prática / Quiz Interativo
              │     └── Entrega / Resposta do Aluno
              └── Progresso Individual e da Turma
```

## 2. Atores e Papéis
- **Aluno (Criança / Infantil)**:
  - Consome aulas, assiste histórias em formato streaming, responde quizzes bíblicos interativos e acumula estrelas/conquistas pedagógicas.
- **Professor / Educador (Meu Espaço)**:
  - Gerencia turmas (`turmas`), visualiza frequência, acompanha lições entregues, faz download dos kits pedagógicos e planos de aula em PDF.
- **Líder EBD / Pastor / Diretor (Minha Igreja / Minha Escola)**:
  - Visão administrativa da congregação/escola, cadastro e ativação de membros, relatórios de engajamento e controle de licenças.
- **Família / Pais (Minha Família)**:
  - Controle parental de tempo de tela, relatórios semanais das histórias bíblicas aprendidas e atividades complementares no lar.

## 3. Diretrizes Técnicas
- **Streaming de Vídeo & Aulas**:
  - HTML5 Video / HLS com retenção de progresso no Supabase (`watch_progress`).
  - Nunca carregar vídeos sem interação do usuário (`autoplay` inteligente com `muted` ou poster inicial leve).
- **Materiais em PDF**:
  - Armazenados em Supabase Storage (`materials` bucket).
  - Disponíveis para visualização online e download offline para impressão na igreja/escola.
- **Preservação de Dados**:
  - Não alterar regras de negócio, tabelas ou RLS de turmas, alunos e professores sem validação explícita.
