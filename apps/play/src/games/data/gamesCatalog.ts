import { GameDefinition } from '../types'

export const BIBLICAL_GAMES_CATALOG: GameDefinition[] = [
  {
    id: 'game-zaqueu',
    slug: 'zaqueu',
    title: 'Zaqueu — O Encontro com Jesus',
    description: 'Atravesse as ruas ensolaradas de Jericó em 3D, explore o mercado antigo e prepare-se para encontrar Jesus!',
    game_type: 'adventure',
    age_range: '6-8',
    difficulty: 'medio',
    cover_url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=800&q=80',
    instructions: 'Explore Jericó com as teclas WASD ou joystick virtual no celular. Pule sobre obstáculos e colete estrelas!',
    learning_goal: 'O chamado transformador de Jesus e acolhimento (Lucas 19:1–10).',
    is_featured: true,
    status: 'published',
    config: {
      chapter: 'Lucas 19:1–10',
      world: 'Jericó 3D'
    }
  },
  {
    id: 'game-ovelha',
    slug: 'a-ovelha-perdida',
    title: 'A Ovelha Perdida',
    description: 'Acompanhe o bom pastor em uma jornada por vales e florestas para resgatar a ovelhinha que se perdeu!',
    game_type: 'adventure',
    age_range: '6-8',
    difficulty: 'facil',
    cover_url: 'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?auto=format&fit=crop&w=800&q=80',
    instructions: 'Use as teclas A/D ou setas para mover, Espaço para pular e colete as pistas de lã para encontrar a ovelha.',
    learning_goal: 'O amor incondicional e o cuidado de Deus por cada um de nós (Lucas 15:1–7).',
    is_featured: true,
    status: 'published',
    config: {
      parable: 'Lucas 15:1–7',
      visualStyle: 'cartoon-2d'
    }
  },
  {
    id: 'game-01',
    slug: 'construa-a-arca',
    title: 'Construa a Arca',
    description: 'Encaixe a quilha, o casco, as janelas e o telhado para aprontar a grande Arca de Noé!',
    game_type: 'puzzle',
    age_range: '3-5',
    difficulty: 'facil',
    cover_url: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=800&q=80',
    instructions: 'Arraste ou selecione cada peça de madeira e coloque-a no lugar correto da Arca.',
    learning_goal: 'Obediência a Deus e perseverança.',
    is_featured: true,
    status: 'published',
    config: {
      targetIllustrationName: 'Grande Arca de Madeira de Gofer',
      pieces: [
        { id: 'p1', label: 'Quilha Base', emoji: '🪵', color: '#b45309' },
        { id: 'p2', label: 'Casco Lateral', emoji: '🚢', color: '#d97706' },
        { id: 'p3', label: 'Grande Janela', emoji: '🪟', color: '#0284c7' },
        { id: 'p4', label: 'Telhado Firme', emoji: '🏠', color: '#92400e' },
        { id: 'p5', label: 'Rampa de Acesso', emoji: '🚪', color: '#78350f' }
      ]
    }
  },
  {
    id: 'game-02',
    slug: 'animais-para-a-arca',
    title: 'Animais para a Arca',
    description: 'Encontre os pares de animais e ajude Noé a levá-los de dois em dois para a Arca!',
    game_type: 'memory',
    age_range: 'all',
    difficulty: 'facil',
    cover_url: 'https://images.unsplash.com/photo-1534188753412-3e26d0d618d6?auto=format&fit=crop&w=800&q=80',
    instructions: 'Vire as cartas e encontre os dois animais iguais para fazê-los entrar na Arca.',
    learning_goal: 'O cuidado e amor de Deus por toda a criação.',
    is_featured: true,
    status: 'published',
    config: {
      pairs: [
        { key: 'leao', label: 'Leãozinho', emoji: '🦁' },
        { key: 'elefante', label: 'Elefante', emoji: '🐘' },
        { key: 'girafa', label: 'Girafa', emoji: '🦒' },
        { key: 'ovelha', label: 'Ovelhinha', emoji: '🐑' },
        { key: 'pomba', label: 'Pombinha', emoji: '🕊️' },
        { key: 'urso', label: 'Ursinho', emoji: '🐻' }
      ]
    }
  },
  {
    id: 'game-03',
    slug: 'davi-contra-golias',
    title: 'Davi contra Golias',
    description: 'Ajude o jovem Davi a coletar 5 pedras lisas pelo riacho e confiar no Senhor!',
    game_type: 'adventure',
    age_range: '6-8',
    difficulty: 'medio',
    cover_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    instructions: 'Mova Davi, pule os troncos e pedras grandes, recolha as 5 pedras lisas e enfrente o desafio com a funda.',
    learning_goal: 'Coragem e confiança plena em Deus.',
    is_featured: true,
    status: 'published',
    config: {
      characterName: 'Davi',
      characterEmoji: '👦',
      targetItemsCount: 5,
      targetItemName: 'Pedras Lisas',
      targetItemEmoji: '🪨',
      bossName: 'Golias',
      bossEmoji: '🛡️',
      faithMessage: 'A vitória não depende de tamanho ou força, mas do poder de Deus!'
    }
  },
  {
    id: 'game-05',
    slug: 'abra-o-mar-vermelho',
    title: 'Abra o Mar Vermelho',
    description: 'Ordene os atos de fé de Moisés para que as grandes águas se abram em terra seca!',
    game_type: 'sequence',
    age_range: 'all',
    difficulty: 'facil',
    cover_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    instructions: 'Coloque as ações na ordem certa para Moisés estender o cajado e o povo atravessar.',
    learning_goal: 'Deus abre caminhos onde não há caminho.',
    is_featured: true,
    status: 'published',
    config: {
      narrativeGoal: 'Ajude Moisés e o povo a atravessar o mar!',
      steps: [
        { id: 's1', label: 'Povo Clama', emoji: '🙏', correctOrder: 0 },
        { id: 's2', label: 'Estender Cajado', emoji: '🪄', correctOrder: 1 },
        { id: 's3', label: 'Vento Forte', emoji: '💨', correctOrder: 2 },
        { id: 's4', label: 'Caminho Seco', emoji: '🌊', correctOrder: 3 },
        { id: 's5', label: 'Povo Salvo', emoji: '🎉', correctOrder: 4 }
      ]
    }
  },
  {
    id: 'game-07',
    slug: 'daniel-e-os-leoes',
    title: 'Daniel e os Leões',
    description: 'Guie Daniel pelo labirinto da Babilônia recolhendo suas orações até a saída!',
    game_type: 'maze',
    age_range: '6-8',
    difficulty: 'medio',
    cover_url: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&w=800&q=80',
    instructions: 'Use as setas para desviar dos obstáculos e chegar em segurança ao anjo protetor.',
    learning_goal: 'Fidelidade e comunhão diária com Deus.',
    is_featured: true,
    status: 'published',
    config: {
      characterName: 'Daniel',
      characterEmoji: '🧔',
      exitEmoji: '👼',
      exitLabel: 'Anjo do Senhor',
      obstacleEmoji: '🧱',
      collectibleEmoji: '📜',
      totalCollectibles: 3,
      faithMessage: 'Deus enviou Seu anjo e fechou a boca dos leões!'
    }
  },
  {
    id: 'game-17',
    slug: 'pesca-maravilhosa',
    title: 'Pesca Maravilhosa',
    description: 'Lance a rede sobre o barco de Pedro e recolha a abundância enviada por Jesus!',
    game_type: 'catch',
    age_range: 'all',
    difficulty: 'facil',
    cover_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    instructions: 'Mova a rede para a direita ou esquerda e pegue 10 peixinhos prateados.',
    learning_goal: 'Confiança na palavra de Jesus gera frutos abundantes.',
    is_featured: true,
    status: 'published',
    config: {
      catcherEmoji: '⛵',
      catcherName: 'Barco de Pedro',
      targetItemEmoji: '🐟',
      targetCount: 10,
      targetItemName: 'Peixinhos',
      faithMessage: 'Lançaram as redes sob a palavra de Jesus e colheram com grande alegria!'
    }
  },
  {
    id: 'game-19',
    slug: 'memoria-herois-da-fe',
    title: 'Memória dos Heróis da Fé',
    description: 'Encontre os pares dos grandes homens e mulheres de fé de toda a Bíblia!',
    game_type: 'memory',
    age_range: '6-8',
    difficulty: 'medio',
    cover_url: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=800&q=80',
    instructions: 'Vire as cartas e ache o par de Davi, Noé, Moisés, Ester, Daniel e José.',
    learning_goal: 'Inspirar a fé através dos exemplos da Palavra.',
    is_featured: true,
    status: 'published',
    config: {
      pairs: [
        { key: 'davi', label: 'Davi', emoji: '👑' },
        { key: 'noe', label: 'Noé', emoji: '🌈' },
        { key: 'moises', label: 'Moisés', emoji: '📜' },
        { key: 'ester', label: 'Ester', emoji: '👸' },
        { key: 'daniel', label: 'Daniel', emoji: '🦁' },
        { key: 'jose', label: 'José', emoji: '🌾' }
      ]
    }
  },
  {
    id: 'game-20',
    slug: 'a-biblia-em-ordem',
    title: 'A Bíblia em Ordem',
    description: 'Organize os dias da Criação do mundo na sequência estabelecida pelo Criador!',
    game_type: 'sequence',
    age_range: 'all',
    difficulty: 'medio',
    cover_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    instructions: 'Coloque a criação da luz, céus, plantas, estrelas e seres vivos na ordem correta.',
    learning_goal: 'Deus é o criador de tudo com ordem e beleza.',
    is_featured: true,
    status: 'published',
    config: {
      narrativeGoal: 'Organize os dias da grande Criação!',
      steps: [
        { id: 'd1', label: '1º Dia: Luz', emoji: '✨', correctOrder: 0 },
        { id: 'd2', label: '2º Dia: Céus e Águas', emoji: '☁️', correctOrder: 1 },
        { id: 'd3', label: '3º Dia: Terra e Plantas', emoji: '🌿', correctOrder: 2 },
        { id: 'd4', label: '4º Dia: Sol e Lua', emoji: '☀️', correctOrder: 3 },
        { id: 'd5', label: '5º Dia: Aves e Peixes', emoji: '🕊️', correctOrder: 4 },
        { id: 'd6', label: '6º Dia: Homem e Animais', emoji: '🦁', correctOrder: 5 }
      ]
    }
  }
]
