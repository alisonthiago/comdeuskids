export interface CDKAvatar {
  id: string
  name: string
  subtitle: string
  category: 'heroes' | 'teachers' | 'animals'
  role: 'kid' | 'parent' | 'teacher' | 'leader'
  image_url: string
  bgGradient: string
  iconEmoji: string
  description: string
}

type LibraryCategory = CDKAvatar['category']
type LibraryRole = CDKAvatar['role']

const createOfficialAvatarSet = (
  folder: string,
  label: string,
  count: number,
  category: LibraryCategory,
  role: LibraryRole,
  iconEmoji: string,
  bgGradient: string,
  startAt = 1
): CDKAvatar[] => Array.from({ length: count }, (_, index) => ({
  id: `biblioteca_${folder.replace(/\//g, '_')}_${startAt + index}`,
  name: `${label} ${index + 1}`,
  subtitle: 'Biblioteca de avatares',
  category,
  role,
  image_url: `/avatar-library/${folder}/${folder}-${startAt + index}.png`,
  bgGradient,
  iconEmoji,
  description: `Avatar ${index + 1} da biblioteca oficial Com Deus Kids`
}))

// Biblioteca aprovada: avatares nativos 1000×1000, organizados por família.
const OFFICIAL_AVATAR_LIBRARY: CDKAvatar[] = [
  ...createOfficialAvatarSet('meninos', 'Menino', 5, 'heroes', 'kid', '👦', 'linear-gradient(135deg, #16c784, #0f9f70)'),
  ...createOfficialAvatarSet('meninas', 'Menina', 5, 'heroes', 'kid', '👧', 'linear-gradient(135deg, #fb7185, #f97316)'),
  ...createOfficialAvatarSet('homens', 'Pai', 5, 'teachers', 'parent', '👨', 'linear-gradient(135deg, #0ea5e9, #14b8a6)'),
  ...createOfficialAvatarSet('mulheres', 'Mãe', 5, 'teachers', 'parent', '👩', 'linear-gradient(135deg, #ec4899, #8b5cf6)'),
  ...createOfficialAvatarSet('avos', 'Avô', 3, 'teachers', 'leader', '👴', 'linear-gradient(135deg, #f59e0b, #fb7185)'),
  ...createOfficialAvatarSet('avos', 'Avó', 3, 'teachers', 'leader', '👵', 'linear-gradient(135deg, #f59e0b, #fb7185)', 4),
  ...createOfficialAvatarSet('avos', 'Avô', 1, 'teachers', 'leader', '👴', 'linear-gradient(135deg, #f59e0b, #fb7185)', 7),
  ...createOfficialAvatarSet('avos', 'Avó', 1, 'teachers', 'leader', '👵', 'linear-gradient(135deg, #f59e0b, #fb7185)', 8),
  ...createOfficialAvatarSet('pets', 'Cachorro', 3, 'animals', 'kid', '🐶', 'linear-gradient(135deg, #f97316, #facc15)'),
  ...createOfficialAvatarSet('pets', 'Gato', 3, 'animals', 'kid', '🐱', 'linear-gradient(135deg, #f97316, #facc15)', 4),
  ...createOfficialAvatarSet('biblicos/jesus', 'Jesus', 3, 'heroes', 'kid', '💚', 'linear-gradient(135deg, #60a5fa, #fbbf24)'),
  ...createOfficialAvatarSet('biblicos/sansao', 'Sansão', 3, 'heroes', 'kid', '💪', 'linear-gradient(135deg, #f97316, #8b5cf6)'),
  ...createOfficialAvatarSet('biblicos/noe', 'Noé', 3, 'heroes', 'kid', '🕊️', 'linear-gradient(135deg, #38bdf8, #facc15)'),
  ...createOfficialAvatarSet('biblicos/davi', 'Davi', 3, 'heroes', 'kid', '🎵', 'linear-gradient(135deg, #16a34a, #0ea5e9)'),
  ...createOfficialAvatarSet('biblicos/maria', 'Maria', 3, 'heroes', 'kid', '🌷', 'linear-gradient(135deg, #ec4899, #8b5cf6)'),
  ...createOfficialAvatarSet('biblicos/rute', 'Rute', 3, 'heroes', 'kid', '🌾', 'linear-gradient(135deg, #f59e0b, #fb7185)'),
  ...createOfficialAvatarSet('biblicos/marta', 'Marta', 3, 'heroes', 'kid', '✨', 'linear-gradient(135deg, #14b8a6, #6366f1)')
]

export const CDK_AVATARS: CDKAvatar[] = [
  ...OFFICIAL_AVATAR_LIBRARY,

  // 1. Heróis da Bíblia & Crianças
  {
    id: 'davi',
    name: 'Davi',
    subtitle: 'Pastorzinho',
    category: 'heroes',
    role: 'kid',
    image_url: '/avatars/davi.png',
    bgGradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    iconEmoji: '👦',
    description: 'Corajoso pastorzinho que confia no Senhor'
  },
  {
    id: 'sara',
    name: 'Sara',
    subtitle: 'Com Florzinha',
    category: 'heroes',
    role: 'kid',
    image_url: '/avatars/sara.png',
    bgGradient: 'linear-gradient(135deg, #ec4899, #be185d)',
    iconEmoji: '👧',
    description: 'Menina cheia de fé e alegria'
  },
  {
    id: 'noe',
    name: 'Noé',
    subtitle: 'Com Túnica',
    category: 'heroes',
    role: 'kid',
    image_url: '/avatars/noe.png',
    bgGradient: 'linear-gradient(135deg, #10b981, #047857)',
    iconEmoji: '⛵',
    description: 'Amigo dos animais e obediente a Deus'
  },
  {
    id: 'ester',
    name: 'Ester',
    subtitle: 'Diadema Dourado',
    category: 'heroes',
    role: 'kid',
    image_url: '/avatars/ester.png',
    bgGradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
    iconEmoji: '👑',
    description: 'Rainha sábia e cheia de graça'
  },
  {
    id: 'daniel',
    name: 'Daniel',
    subtitle: 'Amigo Leão',
    category: 'heroes',
    role: 'kid',
    image_url: '/avatars/daniel.png',
    bgGradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
    iconEmoji: '🦁',
    description: 'Fiel na oração e protegido por Deus'
  },
  {
    id: 'moises',
    name: 'Moisés',
    subtitle: 'Com Cajado',
    category: 'heroes',
    role: 'kid',
    image_url: '/avatars/moises.png',
    bgGradient: 'linear-gradient(135deg, #f59e0b, #b45309)',
    iconEmoji: '📜',
    description: 'Líder corajoso guiado por Deus'
  },
  {
    id: 'pedro',
    name: 'Pedro',
    subtitle: 'Explorador',
    category: 'heroes',
    role: 'kid',
    image_url: '/avatars/pedro.png',
    bgGradient: 'linear-gradient(135deg, #06b6d4, #0891b2)',
    iconEmoji: '🧢',
    description: 'Aventureiro e animado'
  },

  // 2. Professores & Educadores
  {
    id: 'profa_ana',
    name: 'Profª Ana',
    subtitle: 'Óculos Modernos',
    category: 'teachers',
    role: 'teacher',
    image_url: '/avatars/profa_ana.png',
    bgGradient: 'linear-gradient(135deg, #f43f5e, #be123c)',
    iconEmoji: '👩‍🏫',
    description: 'Educadora cristã e professora de EBD'
  },
  {
    id: 'lucas',
    name: 'Prof. Lucas',
    subtitle: 'Com Violão',
    category: 'teachers',
    role: 'teacher',
    image_url: '/avatars/lucas.png',
    bgGradient: 'linear-gradient(135deg, #6366f1, #4338ca)',
    iconEmoji: '🎸',
    description: 'Professor de música e louvor infantil'
  },
  {
    id: 'maria',
    name: 'Coord. Maria',
    subtitle: 'Contadora',
    category: 'teachers',
    role: 'leader',
    image_url: '/avatars/maria.png',
    bgGradient: 'linear-gradient(135deg, #8b5cf6, #5b21b6)',
    iconEmoji: '📖',
    description: 'Coordenadora e contadora de histórias'
  },

  // 3. Animais da Arca & Mascotes
  {
    id: 'cordeirinho',
    name: 'Cordeiro',
    subtitle: 'Cordeirinho da Paz',
    category: 'animals',
    role: 'kid',
    image_url: '/avatars/cordeirinho.png',
    bgGradient: 'linear-gradient(135deg, #a855f7, #7e22ce)',
    iconEmoji: '🐑',
    description: 'O Senhor é o meu bom pastor'
  },
  {
    id: 'pombinha',
    name: 'Pombinha',
    subtitle: 'Pombinha da Paz',
    category: 'animals',
    role: 'kid',
    image_url: '/avatars/pombinha.png',
    bgGradient: 'linear-gradient(135deg, #38bdf8, #0284c7)',
    iconEmoji: '🕊️',
    description: 'Símbolo da paz e do Espírito Santo'
  },
  {
    id: 'leaozinho',
    name: 'Leãozinho',
    subtitle: 'Leãozinho de Judá',
    category: 'animals',
    role: 'kid',
    image_url: '/avatars/leaozinho.png',
    bgGradient: 'linear-gradient(135deg, #f59e0b, #d97706)',
    iconEmoji: '🦁',
    description: 'O Leão da Tribo de Judá'
  },
  {
    id: 'peixinho',
    name: 'Peixinho',
    subtitle: 'Peixinho de Jonas',
    category: 'animals',
    role: 'kid',
    image_url: '/avatars/peixinho.png',
    bgGradient: 'linear-gradient(135deg, #0284c7, #0369a1)',
    iconEmoji: '🐟',
    description: 'Amigo dos mares e do grande milagre'
  }
]

/** Biblioteca disponível para escolha: somente os novos avatares oficiais. */
export const CDK_PROFILE_AVATARS = CDK_AVATARS.filter(avatar => avatar.id.startsWith('biblioteca_'))

// Perfis já existentes continuam válidos, mas passam a exibir a nova biblioteca.
const LEGACY_AVATAR_REPLACEMENTS: Record<string, string> = {
  davi: 'biblioteca_biblicos_davi_1',
  sara: 'biblioteca_meninas_1',
  profa_ana: 'biblioteca_mulheres_1',
  alison: 'biblioteca_homens_1',
  nadia: 'biblioteca_mulheres_2',
  carlos: 'biblioteca_homens_2',
  joao: 'biblioteca_meninos_1',
  ester: 'biblioteca_meninas_2',
  noe: 'biblioteca_biblicos_noe_1',
  daniel: 'biblioteca_meninos_2',
  moises: 'biblioteca_meninos_3',
  pedro: 'biblioteca_meninos_4',
  lucas: 'biblioteca_meninos_5',
  maria: 'biblioteca_biblicos_maria_1'
}

/** Resolve avatares novos da biblioteca e também migra identificadores legados. */
export const getAvatarImageUrl = (avatarUrl?: string | null, fallback = '/avatar-library/meninos/meninos-1.png') => {
  if (!avatarUrl) return fallback
  if (avatarUrl.startsWith('/') || avatarUrl.startsWith('http')) return avatarUrl

  const lookupId = LEGACY_AVATAR_REPLACEMENTS[avatarUrl.toLowerCase()] || avatarUrl
  const selected = CDK_PROFILE_AVATARS.find(avatar => avatar.id === lookupId)
  return selected?.image_url || `/avatars/${avatarUrl.toLowerCase()}.png`
}

export function getAvatarById(id: string): CDKAvatar {
  const cleanId = id?.toLowerCase().replace('.png', '').replace('/avatars/', '')
  return CDK_AVATARS.find(a => a.id === cleanId) || CDK_AVATARS[0]
}
