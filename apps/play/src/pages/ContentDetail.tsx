import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useProfile } from '../context/ProfileContext'
import { getAvatarImageUrl } from '../data/avatars'
import { STREAM_CATALOG } from '../data/streamCatalog'
import { StreamContent, StreamEpisode } from '@comdeuskids/types'
import {
  ArrowLeft, Search, Star, Play, Pause, ChevronRight, Plus, Check,
  Heart, Download, Share2, RotateCcw, Volume2, VolumeX, Maximize,
  Award, BookOpen, FileText, CheckCircle2, Bookmark, Sparkles, X,
  PlayCircle, HelpCircle, Palette, CheckCircle, Eye, CornerDownRight,
  Sparkle, Trophy, Compass, RotateCw
} from 'lucide-react'

// Dados bíblicos aprofundados para cada história bíblica
interface StoryPedagogy {
  categoryBadge: string
  aboutText: string
  learningPoints: string[]
  verseQuote: string
  verseReference: string
  lessonTitle: string
  lessonText: string
  familyQuestion: string
  quizQuestion: string
  quizOptions: { text: string; isCorrect: boolean }[]
  quizExplanation: string
  activity1Title: string
  activity1Desc: string
  activity1Pages: string
  activity2Title: string
  activity2Desc: string
  activity2Pages: string
  bannerImg: string
}

const STORY_PEDAGOGY_MAP: Record<string, StoryPedagogy> = {
  'davi-golias': {
    categoryBadge: 'História Bíblica',
    bannerImg: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB7ANrOgmKWrJoa01Jzx5EV7HfbkHYTHUxtekdJSItLkrcZ_xmua953I18WbPGPOmeoYGib7WS-FoC2xRDNYyApm-NrB1ES5cUMDe1wQLw7F4B4gPR8SbOohtF9eLgpIKU1rlc3XivmtAv6bRbS-y-OJUHU0dH4c0zxFejAE90A4A03QdWv37HifwlvGETnFoo_VI8kcLQayQt_EFbHEb3xRIQOLjcqxk-XitKOI0gqrqjv8t3_-KhB',
    aboutText: 'Golias zombava do exército de Israel com sua força assustadora e sua armadura de bronze. Mas o pequeno Davi sabia que não precisava de espadas reluzentes ou couraças pesadas: ele caminhava em nome do Deus Vivo. Uma obra emocionante que ensina aos pequenos que o amor e a coragem vencem qualquer medo.',
    learningPoints: [
      'Confiar em Deus mesmo quando nos sentimos pequenos e desprotegidos.',
      'Ter coragem frente às dificuldades do dia a dia na escola ou em casa.',
      'Lembrar que o Senhor não olha para a aparência exterior, mas contempla o coração.'
    ],
    verseQuote: 'Porque a batalha é do Senhor, e Ele vos entregará nas nossas mãos!',
    verseReference: '1 Samuel 17:47',
    lessonTitle: 'Qual é o seu gigante hoje?',
    lessonText: 'Às vezes nossos gigantes não usam lanças ou armaduras. Eles se chamam medo do escuro, vergonha de falar com novos amigos ou tristeza quando algo dá errado. Mas a história de Davi nos ensina que Deus é infinitamente maior do que qualquer problema!',
    familyQuestion: 'Existe algo que te deixa com medo ultimamente? Como podemos orar juntos agora para pedir coragem a Deus?',
    quizQuestion: 'O que Davi usou para vencer o gigante Golias?',
    quizOptions: [
      { text: 'A) Uma armadura de ferro e espada pesada', isCorrect: false },
      { text: 'B) Uma funda, pedrinhas e fé em Deus', isCorrect: true },
      { text: 'C) Um escudo de bronze brilhante', isCorrect: false }
    ],
    quizExplanation: 'Muito bem! Davi sabia que a força real vem do Senhor dos Exércitos!',
    activity1Title: 'Caderno de Atividades Davi & Golias',
    activity1Desc: 'Labirintos, caça-palavras e perguntas bíblicas infantis. 18 páginas.',
    activity1Pages: '18 páginas',
    activity2Title: 'Davi e Sua Harpa',
    activity2Desc: 'Páginas de colorir lúdicas para os menores estimularem a criatividade.',
    activity2Pages: '12 páginas'
  },
  'arca-de-noe': {
    categoryBadge: 'Série 3D Bíblica',
    bannerImg: '/banners/arca_noe_banner.jpg',
    aboutText: 'A jornada épica de fé e obediência de Noé e sua família. Diante do impossível, uma grande arca foi construída sob a ordem divina para abrigar todas as criaturas da terra. Uma promessa eterna que atravessa gerações e ensina o cuidado incondicional de Deus.',
    learningPoints: [
      'Obedecer a Deus mesmo quando os outros não compreendem.',
      'Trabalhar em família com amor, perseverança e união.',
      'Confiar nas promessas de Deus, lembrando do arco-íris da aliança.'
    ],
    verseQuote: 'Porei o meu arco nas nuvens, e ele será o sinal da aliança entre mim e a terra.',
    verseReference: 'Gênesis 9:13',
    lessonTitle: 'Como navegar em segurança na tempestade?',
    lessonText: 'A chuva forte caiu por 40 dias e 40 noites, mas dentro da arca havia paz, união e a proteção de Deus. Quando passamos por dias difíceis, nossa casa pode ser como a arca: um refúgio seguro de amor e oração!',
    familyQuestion: 'Como podemos demonstrar mais união em nossa família quando passamos por um dia cansativo?',
    quizQuestion: 'Qual ave voltou para a arca trazendo uma folha de oliveira no bico?',
    quizOptions: [
      { text: 'A) Uma águia veloz', isCorrect: false },
      { text: 'B) Uma pombinha mansa', isCorrect: true },
      { text: 'C) Um corvo preto', isCorrect: false }
    ],
    quizExplanation: 'Exatamente! A pombinha trouxe a folhinha de oliveira anunciando paz e terra firme!',
    activity1Title: 'Caderno de Atividades da Arca',
    activity1Desc: 'Animais aos pares, caça-palavras e labirintos divertidos.',
    activity1Pages: '32 páginas',
    activity2Title: 'Os Bichinhos na Arca de Noé',
    activity2Desc: 'Lindos desenhos para colorir com giz de cera e tinta guache.',
    activity2Pages: '20 páginas'
  },
  'daniel-leoes': {
    categoryBadge: 'História Bíblica',
    bannerImg: '/thumbnails/daniel_leoes.jpg',
    aboutText: 'Daniel amava a Deus e orava três vezes ao dia com a janela aberta em direção a Jerusalém. Mesmo quando lançaram uma lei para proibir suas orações, ele permaneceu fiel. Na cova escura, o anjo do Senhor fechou a boca dos leões famintos!',
    learningPoints: [
      'Nunca deixar de orar e conversar com o Pai Celestial todos os dias.',
      'Permanecer fiel e honesto mesmo sob pressão de outras pessoas.',
      'A certeza de que Deus envia Seus anjos para guardar os que O amam.'
    ],
    verseQuote: 'O meu Deus enviou o Seu anjo, e fechou a boca dos leões, para que não me fizessem dano.',
    verseReference: 'Daniel 6:22',
    lessonTitle: 'A força da oração diária',
    lessonText: 'Daniel não precisou brigar com ninguém. Ele apenas orava com calma e confiança. A oração sincera tem o poder de acalmar o coração e fechar a boca de qualquer leão que nos assuste!',
    familyQuestion: 'Que tal escolhermos um momento do dia só nosso para orar juntos e agradecer a Deus por tudo?',
    quizQuestion: 'O que aconteceu quando Daniel foi colocado na cova dos leões?',
    quizOptions: [
      { text: 'A) Daniel usou uma corda para fugir da cova', isCorrect: false },
      { text: 'B) Deus enviou um anjo que fechou a boca dos leões', isCorrect: true },
      { text: 'C) Os leões dormiram por causa do frio', isCorrect: false }
    ],
    quizExplanation: 'Maravilha! Deus enviou o Seu anjo protetor e guardou a vida de Daniel!',
    activity1Title: 'Caderno de Atividades Daniel na Babilônia',
    activity1Desc: 'Enigmas bíblicos, leões brincalhões e versículos para memorizar.',
    activity1Pages: '16 páginas',
    activity2Title: 'Daniel e os Leões Adormecidos',
    activity2Desc: 'Páginas lúdicas para colorir a cova dos leões iluminada por anjos.',
    activity2Pages: '14 páginas'
  },
  'moises-mar-vermelho': {
    categoryBadge: 'História Bíblica',
    bannerImg: '/thumbnails/moises_mar.jpg',
    aboutText: 'Encurralados entre o exército do faraó e as águas profundas do Mar Vermelho, o povo teve medo. Mas Moisés ergueu o cajado sob a ordem de Deus, um vento forte soprou a noite toda e o mar se abriu em duas muralhas cristalinas!',
    learningPoints: [
      'Quando não houver saída aos nossos olhos, Deus abre um caminho milagroso.',
      'Seguir a liderança de Deus com fé e coragem.',
      'Celebrar e cantar hinos de gratidão pelas grandes vitórias do Senhor.'
    ],
    verseQuote: 'O Senhor pelejará por vós, e vós vos calareis.',
    verseReference: 'Êxodo 14:14',
    lessonTitle: 'Quando Deus abre caminhos no deserto',
    lessonText: 'Às vezes olhamos para a frente e parece não haver solução. Mas Deus é o Deus do impossível! Ele abre caminhos no meio do mar para que Seus filhos passem a pé enxuto!',
    familyQuestion: 'Você já sentiu que algo era difícil demais de resolver? Como podemos confiar que Deus tem o controle?',
    quizQuestion: 'O que Moisés usou para o mar se abrir em duas muralhas?',
    quizOptions: [
      { text: 'A) Um barco dourado', isCorrect: false },
      { text: 'B) Seu cajado erguido em obediência a Deus', isCorrect: true },
      { text: 'C) Uma espada de prata reluzente', isCorrect: false }
    ],
    quizExplanation: 'Correto! Moisés ergueu o cajado e Deus enviou o vento forte que abriu o mar!',
    activity1Title: 'Caderno de Atividades Êxodo & Mar Vermelho',
    activity1Desc: 'Labirintos nas muralhas de água e a marcha da libertação.',
    activity1Pages: '20 páginas',
    activity2Title: 'A Travessia do Mar Vermelho',
    activity2Desc: 'Páginas épicas para colorir o mar dividido e os peixinhos na água.',
    activity2Pages: '16 páginas'
  },
  'rainha-ester': {
    categoryBadge: 'História Bíblica',
    bannerImg: '/thumbnails/rainha_ester.jpg',
    aboutText: 'Uma jovem humilde e corajosa que se tornou rainha da Pérsia. Quando seu povo enfrentou um terrível perigo, Ester convocou jejum e oração e se apresentou diante do rei com graça e sabedoria incomparáveis para salvar toda a nação.',
    learningPoints: [
      'Deus coloca cada um de nós no lugar certo para fazermos o bem.',
      'A beleza do caráter, da bondade e da oração sincera.',
      'Ter coragem para defender os que precisam de ajuda.'
    ],
    verseQuote: 'E quem sabe se para um tempo como este chegaste ao reino?',
    verseReference: 'Ester 4:14',
    lessonTitle: 'Usando nossos dons para ajudar o próximo',
    lessonText: 'Ester era linda por fora, mas sua verdadeira força estava no amor ao próximo e na confiança em Deus. Cada um de nós tem uma missão especial no coração de Deus!',
    familyQuestion: 'Como você pode usar seus talentos e seu carinho para ajudar um amigo que esteja precisando na escola?',
    quizQuestion: 'O que Ester pediu para todo o povo fazer antes de ir falar com o rei?',
    quizOptions: [
      { text: 'A) Fazer uma festa barulhenta', isCorrect: false },
      { text: 'B) Orar e jejuar juntos em união', isCorrect: true },
      { text: 'C) Fugir da cidade escondidos', isCorrect: false }
    ],
    quizExplanation: 'Muito bem! A oração e o jejum em família abriram os caminhos para a grande vitória de Ester!',
    activity1Title: 'O Palácio da Rainha Ester',
    activity1Desc: 'Passatempos reais, tiaras e quebra-cabeças da coragem.',
    activity1Pages: '18 páginas',
    activity2Title: 'Livro de Colorir Rainha Ester',
    activity2Desc: 'Coroas, jardins persas e trajes reais prontos para colorir.',
    activity2Pages: '14 páginas'
  },
  'jonas-grande-peixe': {
    categoryBadge: 'História Bíblica',
    bannerImg: '/thumbnails/jonas_peixe.jpg',
    aboutText: 'Jonas tentou fugir de navio para longe da missão de Deus, mas o Senhor enviou um grande peixe para resgatá-lo das águas profundas. Dentro do peixe, Jonas orou, se arrependeu e foi levado com segurança até a praia para cumprir seu chamado.',
    learningPoints: [
      'Não adianta fugir de Deus, porque Ele nos ama e sempre cuida de nós.',
      'A importância do perdão, da segunda chance e da obediência.',
      'O amor e a misericórdia de Deus alcançam a todos os povos.'
    ],
    verseQuote: 'Na minha angústia clamei ao Senhor, e Ele me respondeu.',
    verseReference: 'Jonas 2:2',
    lessonTitle: 'A misericórdia da segunda chance',
    lessonText: 'Quando erramos, Deus não nos abandona. Ele ouve nosso pedido de perdão em qualquer lugar — até na barriga de um grande peixe — e nos dá um novo começo cheio de esperança!',
    familyQuestion: 'Quando você faz algo errado, como se sente ao pedir desculpas e receber um abraço de perdão?',
    quizQuestion: 'Quantos dias Jonas ficou dentro do grande peixe orando?',
    quizOptions: [
      { text: 'A) 1 dia apenas', isCorrect: false },
      { text: 'B) 3 dias e 3 noites', isCorrect: true },
      { text: 'C) 7 dias e noites', isCorrect: false }
    ],
    quizExplanation: 'Isso mesmo! Foram 3 dias e 3 noites até o grande peixe levá-lo em segurança à praia!',
    activity1Title: 'O Fundo do Mar com Jonas',
    activity1Desc: 'Labirintos submarinos, animais marinhos e caça-palavras.',
    activity1Pages: '16 páginas',
    activity2Title: 'Jonas e o Grande Peixe Amigo',
    activity2Desc: 'Desenhos fofos do grande peixe e da praia ensolarada para colorir.',
    activity2Pages: '12 páginas'
  }
}

export default function ContentDetail() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { activeProfile, watchProgress, saveProgress, isInMyList, toggleMyList } = useProfile()

  // Encontrar o conteúdo correspondente
  const content = STREAM_CATALOG.find(c => c.slug === slug || c.id === slug) || STREAM_CATALOG[0] // Default: Davi e Golias
  const pedagogyKey = content.id || 'davi-golias'
  const pedagogy = STORY_PEDAGOGY_MAP[pedagogyKey] || STORY_PEDAGOGY_MAP['davi-golias']

  // Abas: Visão Geral | Série Completa | Lição Bíblica | Quiz Interativo | Caderno de Atividades
  const [activeTab, setActiveTab] = useState<'visao-geral' | 'episodios' | 'licao' | 'quiz' | 'atividades'>('visao-geral')
  const [isLiked, setIsLiked] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Player State
  const [playerOpen, setPlayerOpen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [currentTime, setCurrentTime] = useState(14 * 60 + 20) // 14:20
  const [showCelebration, setShowCelebration] = useState(false)
  const [selectedQuizIdx, setSelectedQuizIdx] = useState<number | null>(null)
  const [quizAnsweredCorrect, setQuizAnsweredCorrect] = useState<boolean | null>(null)

  const inList = isInMyList(content.id)

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const handleOpenPlayer = () => {
    setPlayerOpen(true)
    setIsPlaying(true)
  }

  const handleFinishPlayback = () => {
    setShowCelebration(true)
  }

  const handleQuizAnswer = (idx: number, isCorrect: boolean) => {
    setSelectedQuizIdx(idx)
    setQuizAnsweredCorrect(isCorrect)
  }

  const avatarUrl = getAvatarImageUrl(activeProfile?.avatar_url)

  // Histórias similares do carrossel 'Mais Como Este'
  const similarStories = STREAM_CATALOG.filter(c => c.id !== content.id && c.type !== 'clip').slice(0, 4)

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#131315',
      color: '#e5e1e4',
      paddingBottom: 96,
      fontFamily: "'Plus Jakarta Sans', sans-serif"
    }}>
      {/* A navegação global do StreamLayout já ocupa o topo desta rota. */}
      <header style={{
        display: 'none',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: 64,
        zIndex: 50,
        backgroundColor: 'rgba(19, 19, 21, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <button
            onClick={() => navigate(-1)}
            aria-label="Voltar"
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              backgroundColor: 'rgba(53, 52, 55, 0.5)',
              backdropFilter: 'blur(12px)',
              border: 'none',
              color: '#e5e1e4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              transition: 'transform 0.15s'
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <span style={{
            fontSize: 16,
            fontWeight: 700,
            color: '#e5e1e4',
            letterSpacing: '-0.01em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: 200
          }}>
            Detalhes Do Conteúdo
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => navigate('/videos')}
            aria-label="Buscar"
            style={{
              width: 42,
              height: 42,
              borderRadius: '50%',
              background: 'none',
              border: 'none',
              color: '#cbc3d7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <Search size={20} />
          </button>

          <button
            onClick={() => navigate('/editar-perfil')}
            aria-label="Perfil da Criança"
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              backgroundColor: '#22c55e',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 12px rgba(34, 197, 94, 0.4)',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              overflow: 'hidden'
            }}
          >
            <img
              src={avatarUrl}
              alt="Perfil"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/avatars/davi.png'
              }}
            />
          </button>
        </div>
      </header>

      {/* CONTAINER PRINCIPAL */}
      <main style={{ width: '100%', paddingTop: 56 }}>

        {/* HERO CINEMATOGRÁFICO DE TOPO WIDESCREEN - ENCAIXADO NA SEÇÃO DA TELA */}
        <div className="cdk-widescreen-hero" style={{
          position: 'relative',
          width: '100%',
          height: 'calc(100vh - 56px)',
          minHeight: 'calc(100vh - 56px)',
          maxHeight: 'none',
          aspectRatio: 'unset',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          backgroundColor: '#0e0e10',
          boxSizing: 'border-box'
        }}>
          {/* Imagem de Fundo Heroica Widescreen */}
          <div style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `url(${pedagogy.bannerImg || content.banner_url || '/banners/hero_davi_golias.jpg'})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center center',
            transform: 'scale(1.02)',
            transition: 'transform 0.7s ease'
          }} />

          {/* Gradientes Atmosféricos de Fusão */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, #131315 0%, rgba(19, 19, 21, 0.7) 45%, rgba(19, 19, 21, 0.15) 75%, transparent 100%)',
            pointerEvents: 'none'
          }} />
          <div className="cdk-desktop-only" style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to right, rgba(19, 19, 21, 0.95) 0%, rgba(19, 19, 21, 0.7) 45%, transparent 85%)',
            pointerEvents: 'none'
          }} />
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(19, 19, 21, 0.8) 0%, transparent 35%)',
            pointerEvents: 'none'
          }} />

          {/* Conteúdo do Hero */}
          <div className="cdk-container" style={{
            position: 'relative',
            zIndex: 10,
            paddingBottom: 'clamp(24px, 4vh, 44px)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
            maxWidth: 860
          }}>
            {/* Tag Dourada / Categoria da Fé */}
            <div style={{
              alignSelf: 'flex-start',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 12px',
              borderRadius: 9999,
              backgroundColor: 'rgba(238, 152, 0, 0.25)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255, 185, 95, 0.2)'
            }}>
              <Sparkles size={13} color="#ffb95f" />
              <span style={{
                fontSize: 10,
                fontWeight: 800,
                color: '#ffb95f',
                letterSpacing: '0.08em',
                textTransform: 'uppercase'
              }}>
                {pedagogy.categoryBadge}
              </span>
            </div>

            {/* Título Monumental */}
            <h1 style={{
              fontSize: 'clamp(28px, 4vw, 44px)',
              fontWeight: 800,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              margin: '2px 0 0',
              textShadow: '0 2px 12px rgba(0,0,0,0.8)',
              lineHeight: 1.15
            }}>
              {content.title}
            </h1>

            {/* Metadados em Linha Compacta */}
            <div style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              gap: 8,
              fontSize: 12,
              color: '#cbc3d7',
              margin: '2px 0'
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#ffb95f', fontWeight: 800 }}>
                <Star size={14} fill="#ffb95f" color="#ffb95f" />
                98%
              </span>
              <span style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: '#494454' }} />
              <span>2026</span>
              <span style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: '#494454' }} />
              <span style={{
                padding: '2px 6px',
                borderRadius: 4,
                backgroundColor: 'rgba(53, 52, 55, 0.7)',
                color: '#7bd0ff',
                fontSize: 10,
                fontWeight: 800,
                textTransform: 'uppercase'
              }}>
                LIVRE
              </span>
              <span style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: '#494454' }} />
              <span>{content.duration_minutes || 45} min</span>
              <span style={{ width: 3, height: 3, borderRadius: '50%', backgroundColor: '#494454' }} />
              <span style={{
                padding: '2px 6px',
                borderRadius: 4,
                backgroundColor: 'rgba(53, 52, 55, 0.8)',
                color: '#e5e1e4',
                fontSize: 10,
                fontWeight: 800
              }}>
                4K HDR
              </span>
            </div>

            {/* Sinopse Tocante */}
            <p style={{
              fontSize: 14,
              color: '#cbc3d7',
              margin: '4px 0 10px',
              lineHeight: 1.5,
              maxWidth: 680,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textShadow: '0 1px 4px rgba(0,0,0,0.8)'
            }}>
              {pedagogy.aboutText}
            </p>

            {/* Ações Principais (Botões 1:1 Stitch Adaptativos) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 4, flexWrap: 'wrap' }}>
              {/* Botão Assistir Principal */}
              <button
                id="btn-play-hero"
                onClick={handleOpenPlayer}
                style={{
                  minWidth: 180,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: '#ffffff',
                  color: '#0e0e10',
                  fontSize: 15,
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0 24px',
                  boxShadow: '0 4px 24px rgba(208, 188, 255, 0.35)',
                  transition: 'transform 0.15s'
                }}
              >
                <Play size={22} fill="#0e0e10" color="#0e0e10" />
                <span>ASSISTIR</span>
              </button>

              {/* Botão Minha Lista */}
              <button
                aria-label="Adicionar à Minha Lista"
                onClick={() => {
                  toggleMyList(content.id)
                  showToast(inList ? 'Removido da Minha Lista' : 'Salvo na Minha Lista!')
                }}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: 'rgba(42, 42, 44, 0.8)',
                  backdropFilter: 'blur(12px)',
                  border: 'none',
                  color: inList ? '#22c55e' : '#e5e1e4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.15s'
                }}
              >
                <Bookmark size={22} fill={inList ? '#22c55e' : 'none'} color={inList ? '#22c55e' : '#e5e1e4'} />
              </button>

              {/* Botão Curtir */}
              <button
                aria-label="Curtir história"
                onClick={() => {
                  setIsLiked(!isLiked)
                  showToast(isLiked ? 'Curtida removida' : 'Você amou essa história!')
                }}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: 'rgba(42, 42, 44, 0.8)',
                  backdropFilter: 'blur(12px)',
                  border: 'none',
                  color: isLiked ? '#ffb95f' : '#e5e1e4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.15s'
                }}
              >
                <Heart size={22} fill={isLiked ? '#ffb95f' : 'none'} color="#ffb95f" />
              </button>

              {/* Botão Baixar Offline */}
              <button
                aria-label="Baixar para assistir offline"
                onClick={() => showToast('Iniciando download para assistir offline!')}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  backgroundColor: 'rgba(42, 42, 44, 0.8)',
                  backdropFilter: 'blur(12px)',
                  border: 'none',
                  color: '#e5e1e4',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.15s'
                }}
              >
                <Download size={22} />
              </button>
            </div>
          </div>
        </div>

        {/* CORPO PRINCIPAL COM CONTAINER RESPONSIVO */}
        <div className="cdk-container" style={{ marginTop: 28, width: '100%' }}>

          {/* ATALHOS DA JORNADA 'CONTINUE A EXPERIÊNCIA' (HUB INTERATIVO RESPONSIVO) */}
          <div style={{ marginBottom: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#e5e1e4', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Compass size={20} color="#22c55e" />
                Jornada da Criança
              </span>
              <span style={{ fontSize: 11, fontWeight: 800, color: '#22c55e', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                Passo a Passo
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 12
            }}>
              {/* Card 1: Assistir */}
              <button
                onClick={handleOpenPlayer}
                style={{
                  padding: 14,
                  borderRadius: 14,
                  backgroundColor: '#201f21',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: 'rgba(34, 197, 94, 0.2)',
                  color: '#22c55e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <PlayCircle size={22} fill="#22c55e" color="#052e16" />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 800, color: '#ffffff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    1. Assistir
                  </p>
                  <p style={{ fontSize: 12, color: '#cbc3d7', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {content.type === 'series' ? 'Série 3D' : 'Filme'} • {content.duration_minutes || 45} min
                  </p>
                </div>
              </button>

              {/* Card 2: Lição Viva */}
              <button
                onClick={() => setActiveTab('licao')}
                style={{
                  padding: 14,
                  borderRadius: 14,
                  backgroundColor: '#201f21',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: 'rgba(255, 185, 95, 0.2)',
                  color: '#ffb95f',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <BookOpen size={22} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 800, color: '#ffffff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    2. Lição Viva
                  </p>
                  <p style={{ fontSize: 12, color: '#cbc3d7', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    10 min reflexão
                  </p>
                </div>
              </button>

              {/* Card 3: Quiz */}
              <button
                onClick={() => setActiveTab('quiz')}
                style={{
                  padding: 14,
                  borderRadius: 14,
                  backgroundColor: '#201f21',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: 'rgba(123, 208, 255, 0.2)',
                  color: '#7bd0ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <HelpCircle size={22} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 800, color: '#ffffff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    3. Quiz Bíblico
                  </p>
                  <p style={{ fontSize: 12, color: '#cbc3d7', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    Ganhe 100 pts
                  </p>
                </div>
              </button>

              {/* Card 4: Colorir & PDF */}
              <button
                onClick={() => setActiveTab('atividades')}
                style={{
                  padding: 14,
                  borderRadius: 14,
                  backgroundColor: '#201f21',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  backgroundColor: 'rgba(34, 197, 94, 0.2)',
                  color: '#22c55e',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Palette size={22} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 800, color: '#ffffff', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    4. Colorir &amp; PDF
                  </p>
                  <p style={{ fontSize: 12, color: '#cbc3d7', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {pedagogy.activity1Pages}
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* BARRA DE ABAS HORIZONTAIS COM SCROLL (1:1 STITCH) */}
          <div style={{
            marginTop: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            overflowX: 'auto',
            paddingBottom: 6,
            scrollbarWidth: 'none'
          }}>
            {[
              { key: 'visao-geral', label: 'Visão Geral' },
              { key: 'episodios', label: content.type === 'series' ? 'Série Completa' : 'Episódios & Cenas' },
              { key: 'licao', label: 'Lição Bíblica' },
              { key: 'quiz', label: 'Quiz Interativo' },
              { key: 'atividades', label: 'Caderno de Atividades' }
            ].map((tab) => {
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 9999,
                    fontSize: 13,
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    backgroundColor: isActive ? '#22c55e' : '#2a2a2c',
                    color: isActive ? '#052e16' : '#cbc3d7',
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: isActive ? '0 2px 12px rgba(34, 197, 94, 0.3)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  {tab.label}
                </button>
              )
            })}
          </div>

          {/* CONTEÚDO DAS ABAS INTERATIVAS */}
          <div style={{ marginTop: 20 }}>
            {/* ABA 1: VISÃO GERAL */}
            {activeTab === 'visao-geral' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* Card Sobre a História */}
                <div style={{
                  padding: 20,
                  borderRadius: 16,
                  backgroundColor: '#201f21',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                  border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <BookOpen size={18} color="#22c55e" />
                    Sobre esta História
                  </h3>
                  <p style={{ fontSize: 14, color: '#cbc3d7', lineHeight: 1.6, margin: '10px 0 0' }}>
                    {pedagogy.aboutText}
                  </p>
                </div>

                {/* 3 Aprendizados Bíblicos em Grid */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: 12
                }}>
                  {pedagogy.learningPoints.map((point, index) => (
                    <div
                      key={index}
                      style={{
                        padding: 16,
                        borderRadius: 14,
                        backgroundColor: '#201f21',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
                        display: 'flex',
                        gap: 12,
                        alignItems: 'flex-start'
                      }}
                    >
                      <div style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 185, 95, 0.2)',
                        color: '#ffb95f',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 800,
                        flexShrink: 0
                      }}>
                        {index + 1}
                      </div>
                      <p style={{ fontSize: 13, color: '#e5e1e4', margin: 0, lineHeight: 1.45 }}>
                        {point}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ABA 2: EPISÓDIOS & CENAS */}
            {activeTab === 'episodios' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {(content.episodes || [
                  {
                    id: 'ep-1',
                    episode_number: 1,
                    season_number: 1,
                    title: 'O Chamado da Fé',
                    duration_minutes: 22,
                    thumbnail_url: content.thumbnail_url || '/thumbnails/davi.jpg',
                    synopsis: 'A primeira parte da jornada revelando os propósitos de Deus.'
                  },
                  {
                    id: 'ep-2',
                    episode_number: 2,
                    season_number: 1,
                    title: 'A Vitória no Vale',
                    duration_minutes: 23,
                    thumbnail_url: content.banner_url || '/thumbnails/davi.jpg',
                    synopsis: 'O momento da superação quando a coragem vence o medo.'
                  }
                ]).map((ep, idx) => (
                  <div
                    key={ep.id}
                    onClick={handleOpenPlayer}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: 12,
                      borderRadius: 16,
                      backgroundColor: '#201f21',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}
                  >
                    <div style={{
                      position: 'relative',
                      width: 120,
                      aspectRatio: '16/9',
                      borderRadius: 10,
                      overflow: 'hidden',
                      backgroundColor: '#0e0e10',
                      flexShrink: 0
                    }}>
                      <img
                        src={ep.thumbnail_url || content.thumbnail_url}
                        alt={ep.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <PlayCircle size={22} color="#ffffff" />
                      </div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: 11, fontWeight: 800, color: '#22c55e', textTransform: 'uppercase' }}>
                        EPISÓDIO {ep.episode_number || idx + 1}
                      </span>
                      <h4 style={{ fontSize: 15, fontWeight: 700, color: '#ffffff', margin: '2px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ep.title}
                      </h4>
                      <p style={{ fontSize: 12, color: '#cbc3d7', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {ep.synopsis || 'Uma emocionante lição bíblica para toda a família.'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ABA 3: LIÇÃO BÍBLICA */}
            {activeTab === 'licao' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{
                  padding: 20,
                  borderRadius: 16,
                  backgroundColor: '#201f21',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
                }}>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: '#ffb95f', margin: 0 }}>
                    {pedagogy.lessonTitle}
                  </h3>
                  <p style={{ fontSize: 14, color: '#cbc3d7', lineHeight: 1.6, margin: '12px 0 0' }}>
                    {pedagogy.lessonText}
                  </p>
                </div>

                <div style={{
                  padding: 18,
                  borderRadius: 16,
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  border: '1px solid rgba(34, 197, 94, 0.2)'
                }}>
                  <h4 style={{ fontSize: 14, fontWeight: 800, color: '#22c55e', margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Sparkles size={16} /> Para Conversar em Família
                  </h4>
                  <p style={{ fontSize: 13, color: '#e5e1e4', lineHeight: 1.5, margin: '8px 0 0' }}>
                    {pedagogy.familyQuestion}
                  </p>
                </div>
              </div>
            )}

            {/* ABA 4: QUIZ INTERATIVO */}
            {activeTab === 'quiz' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{
                  padding: 20,
                  borderRadius: 16,
                  backgroundColor: '#201f21',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.3)'
                }}>
                  <span style={{ fontSize: 11, fontWeight: 800, color: '#ffb95f', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                    Pergunta de Fixação
                  </span>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: '#ffffff', margin: '8px 0 16px', lineHeight: 1.4 }}>
                    {pedagogy.quizQuestion}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {pedagogy.quizOptions.map((opt, i) => (
                      <button
                        key={i}
                        onClick={() => handleQuizAnswer(i, opt.isCorrect)}
                        style={{
                          padding: '14px 16px',
                          borderRadius: 12,
                          backgroundColor: selectedQuizIdx === i
                            ? (opt.isCorrect ? '#10b981' : '#ef4444')
                            : '#2a2a2c',
                          color: '#ffffff',
                          fontSize: 14,
                          fontWeight: 600,
                          textAlign: 'left',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          transition: 'all 0.15s'
                        }}
                      >
                        <span>{opt.text}</span>
                        {selectedQuizIdx === i && (
                          opt.isCorrect ? <CheckCircle size={18} /> : <X size={18} />
                        )}
                      </button>
                    ))}
                  </div>

                  {quizAnsweredCorrect !== null && (
                    <div style={{
                      marginTop: 16,
                      padding: 14,
                      borderRadius: 12,
                      backgroundColor: quizAnsweredCorrect ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: quizAnsweredCorrect ? '#10b981' : '#f87171',
                      fontSize: 13,
                      fontWeight: 600
                    }}>
                      {quizAnsweredCorrect ? `🎉 ${pedagogy.quizExplanation}` : 'Tente outra vez! Leia a lição acima.'}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ABA 5: CADERNO DE ATIVIDADES */}
            {activeTab === 'atividades' && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: 16
              }}>
                <div style={{
                  display: 'flex',
                  gap: 14,
                  padding: 16,
                  borderRadius: 16,
                  backgroundColor: '#201f21',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                }}>
                  <div style={{
                    position: 'relative',
                    width: 90,
                    height: 120,
                    borderRadius: 12,
                    overflow: 'hidden',
                    flexShrink: 0,
                    backgroundColor: '#0e0e10'
                  }}>
                    <img
                      src="/materials/mat_davi_cover.jpg"
                      alt={pedagogy.activity1Title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/thumbnails/player_davi_warrior.jpg'
                      }}
                    />
                    <span style={{
                      position: 'absolute',
                      top: 4,
                      left: 4,
                      padding: '2px 6px',
                      borderRadius: 4,
                      backgroundColor: 'rgba(14, 14, 16, 0.85)',
                      color: '#22c55e',
                      fontSize: 9,
                      fontWeight: 800
                    }}>
                      PDF
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', flex: 1, minWidth: 0 }}>
                    <div>
                      <span style={{ fontSize: 9, fontWeight: 800, color: '#22c55e', textTransform: 'uppercase' }}>
                        KIT IMPRIMÍVEL
                      </span>
                      <h4 style={{ fontSize: 14, fontWeight: 800, color: '#ffffff', margin: '2px 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {pedagogy.activity1Title}
                      </h4>
                      <p style={{ fontSize: 11, color: '#cbc3d7', margin: 0, lineHeight: 1.4 }}>
                        {pedagogy.activity1Desc}
                      </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                      <button
                        onClick={() => navigate('/materiais-em-pdf')}
                        style={{
                          flex: 1,
                          height: 34,
                          borderRadius: 8,
                          backgroundColor: '#22c55e',
                          color: '#052e16',
                          fontSize: 11,
                          fontWeight: 800,
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 4,
                          cursor: 'pointer'
                        }}
                      >
                        <Download size={14} />
                        <span>BAIXAR</span>
                      </button>
                      <button
                        onClick={() => navigate('/materiais-em-pdf')}
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 8,
                          backgroundColor: '#2a2a2c',
                          color: '#cbc3d7',
                          border: 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SEÇÃO 'MAIS COMO ESTE' (CARROSSEL HORIZONTAL EXPANDIDO) */}
          <div style={{ marginTop: 44, marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#ffffff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <Sparkle size={20} color="#ffb95f" />
                Mais Como Este
              </h3>
              <span
                onClick={() => navigate('/videos')}
                style={{ fontSize: 12, fontWeight: 800, color: '#22c55e', cursor: 'pointer' }}
              >
                Ver Todos
              </span>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
              gap: 16
            }}>
              {similarStories.map((item) => (
                <div
                  key={item.id}
                  onClick={() => {
                    navigate(`/conteudo/${item.slug}`)
                    window.scrollTo({ top: 0, behavior: 'smooth' })
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 6,
                    cursor: 'pointer',
                    transition: 'transform 0.15s'
                  }}
                >
                  <div style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '2/3',
                    borderRadius: 12,
                    overflow: 'hidden',
                    boxShadow: '0 4px 14px rgba(0,0,0,0.4)',
                    backgroundColor: '#0e0e10'
                  }}>
                    <img
                      src={item.thumbnail_url || item.banner_url}
                      alt={item.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <span style={{
                      position: 'absolute',
                      bottom: 6,
                      left: 6,
                      padding: '2px 6px',
                      borderRadius: 4,
                      backgroundColor: 'rgba(14, 14, 16, 0.85)',
                      color: '#fff',
                      fontSize: 10,
                      fontWeight: 800
                    }}>
                      Livre
                    </span>
                  </div>
                  <p style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: '#ffffff',
                    margin: '3px 0 0',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.title.split(':')[0]}
                  </p>
                  <span style={{ fontSize: 11, color: '#cbc3d7', marginTop: -4 }}>
                    {item.duration_minutes || 40} min
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* OVERLAY DO PLAYER CINEMATOGRÁFICO (INTERATIVO) */}
      {playerOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          backgroundColor: '#0B0B0D',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 'clamp(12px, 2vw, 28px)'
        }}>
          {/* Barra Superior do Player */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <button
              aria-label="Fechar reprodutor"
              onClick={() => setPlayerOpen(false)}
              style={{
                width: 40,
                height: 40,
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(10px)',
                border: 'none',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
            >
              <X size={20} />
            </button>

            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 14, fontWeight: 800, color: '#fff', margin: 0 }}>
                {content.title}
              </p>
              <p style={{ fontSize: 11, color: '#cbc3d7', margin: '2px 0 0' }}>
                {content.type === 'series' ? 'Temporada 1 • Episódio 3' : 'Filme Completo em 4K HDR'}
              </p>
            </div>

            <div style={{ width: 40 }} />
          </div>

          {/* Vídeo / Cena Central */}
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: 1520,
            aspectRatio: '16/9',
            margin: 'clamp(18px, 3vh, 36px) auto',
            borderRadius: 20,
            overflow: 'hidden',
            backgroundColor: '#000',
            boxShadow: '0 12px 40px rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBfvnJXoDH8CnTJr0gdthF5RlrFDmlAJrG5KPeiviVsD167WEPolr0_8-aeihtHruw-tePjwpT_PRRxojnbDZRXoAP6_45jqbxahiq5QroNutyj_hG6eZoSm4-hIfFDYO3dxJwRfiIzbr2JrHDWXmzjvV9gkZMmNsAyyEwgaI6C8HYofl9r_nXOYtU6h8ZSw_FaBP3nSNoAxiQlgw9dVaDIFpmY_-lQDGLG6LAsaOuUP7qTr36Rtnzw"
              alt="Cena"
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
            />

            {/* Controles Centrais */}
            <div style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 28
            }}>
              <button
                onClick={() => setCurrentTime(Math.max(0, currentTime - 10))}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(8px)',
                  border: 'none',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <RotateCcw size={22} />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  backgroundColor: '#ffffff',
                  color: '#000000',
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
                }}
              >
                {isPlaying ? <Pause size={30} fill="#000" /> : <Play size={30} fill="#000" />}
              </button>

              <button
                onClick={() => setCurrentTime(currentTime + 10)}
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: '50%',
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  backdropFilter: 'blur(8px)',
                  border: 'none',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer'
                }}
              >
                <RotateCw size={22} />
              </button>
            </div>

            {/* Scrubber Inferior */}
            <div style={{
              position: 'absolute',
              bottom: 12,
              left: 16,
              right: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 6
            }}>
              <div style={{
                width: '100%',
                height: 5,
                borderRadius: 9999,
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                overflow: 'hidden',
                cursor: 'pointer'
              }}>
                <div style={{ width: '32%', height: '100%', backgroundColor: '#22c55e', borderRadius: 9999 }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'rgba(255,255,255,0.9)', fontWeight: 700 }}>
                <span>14:20</span>
                <span>45:00</span>
              </div>
            </div>
          </div>

          {/* Rodapé do Player com Ação Conclusão / Celebração */}
          <div style={{ width: '100%', maxWidth: 1520, margin: '0 auto' }}>
            <div style={{
              padding: 12,
              borderRadius: 14,
              backgroundColor: '#201f21',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Star size={20} color="#ffb95f" fill="#ffb95f" />
                <div>
                  <p style={{ fontSize: 13, fontWeight: 800, color: '#ffffff', margin: 0 }}>
                    Assistindo com {activeProfile?.name || 'Lucas'}
                  </p>
                  <p style={{ fontSize: 11, color: '#cbc3d7', margin: 0 }}>
                    Próxima Lição disponível
                  </p>
                </div>
              </div>

              <button
                onClick={handleFinishPlayback}
                style={{
                  padding: '6px 14px',
                  borderRadius: 8,
                  backgroundColor: '#ffb95f',
                  color: '#472a00',
                  fontSize: 11,
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Finalizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CELEBRAÇÃO INFANTIL (VOCÊ TERMINOU! 🎉) */}
      {showCelebration && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 10000,
          backgroundColor: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 16
        }}>
          <div style={{
            position: 'relative',
            width: '100%',
            maxWidth: 360,
            padding: 24,
            borderRadius: 24,
            backgroundColor: '#2a2a2c',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
            boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
            overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute',
              top: -40,
              left: 0,
              right: 0,
              height: 100,
              backgroundColor: 'rgba(255, 185, 95, 0.2)',
              borderRadius: '50%',
              filter: 'blur(30px)',
              pointerEvents: 'none'
            }} />

            <div style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              backgroundColor: 'rgba(238, 152, 0, 0.25)',
              color: '#ffb95f',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(238, 152, 0, 0.3)'
            }}>
              <Trophy size={40} color="#ffb95f" />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <span style={{ fontSize: 10, fontWeight: 800, color: '#ffb95f', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                Parabéns Pequeno Vencedor!
              </span>
              <h3 style={{ fontSize: 24, fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Você Terminou! 🎉
              </h3>
              <p style={{ fontSize: 13, color: '#cbc3d7', margin: 0, lineHeight: 1.5 }}>
                Você aprendeu grandes lições de fé com {content.title}. Ganhou +100 estrelas celestiais!
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 8, marginTop: 8 }}>
              <button
                onClick={() => {
                  setShowCelebration(false)
                  setPlayerOpen(false)
                  setActiveTab('quiz')
                }}
                style={{
                  width: '100%',
                  height: 46,
                  borderRadius: 12,
                  backgroundColor: '#22c55e',
                  color: '#052e16',
                  fontSize: 14,
                  fontWeight: 800,
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 4px 14px rgba(34, 197, 94, 0.35)'
                }}
              >
                <HelpCircle size={18} />
                <span>Fazer o Quiz Agora</span>
              </button>

              <button
                onClick={() => {
                  setShowCelebration(false)
                  setPlayerOpen(false)
                }}
                style={{
                  width: '100%',
                  height: 42,
                  borderRadius: 12,
                  backgroundColor: 'rgba(53, 52, 55, 0.6)',
                  color: '#ffffff',
                  fontSize: 13,
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Voltar aos Detalhes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST FLUTUANTE */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: 80,
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: 'rgba(32, 31, 33, 0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid #ffb95f',
          color: '#ffb95f',
          padding: '8px 18px',
          borderRadius: 9999,
          fontSize: 12,
          fontWeight: 800,
          zIndex: 99999,
          boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          gap: 6
        }}>
          <Sparkles size={14} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}
