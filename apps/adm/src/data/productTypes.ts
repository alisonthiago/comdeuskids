import { Clapperboard, Download, Film, Gamepad2, GraduationCap, Music, Puzzle, Video } from 'lucide-react'

export const productTypes = [
  { title: 'Cursos', text: 'Aulas em vídeo, textos, quizzes e materiais para aprender.', icon: GraduationCap, type: 'curso' },
  { title: 'Arquivos', text: 'PDFs, atividades e materiais digitais para baixar e imprimir.', icon: Download, type: 'arquivo' },
  { title: 'Séries', text: 'Histórias bíblicas organizadas em temporadas e episódios.', icon: Clapperboard, type: 'serie' },
  { title: 'Músicas', text: 'Louvores infantis, canções e álbuns para toda a família.', icon: Music, type: 'musica' },
  { title: 'Jogos', text: 'Jogos interativos para aprender e se divertir com a Bíblia.', icon: Gamepad2, type: 'jogo' },
  { title: 'Filmes', text: 'Filmes e aventuras bíblicas para assistir em família.', icon: Film, type: 'filme' },
  { title: 'Vídeos', text: 'Vídeos, clipes e histórias para ensinar e inspirar.', icon: Video, type: 'video' },
  { title: 'Brincadeiras', text: 'Dinâmicas e brincadeiras educativas para casa e igreja.', icon: Puzzle, type: 'brincadeira' }
] as const

export type ProductType = typeof productTypes[number]['type']

export function getProductType(value?: string | null) {
  return productTypes.find(item => item.type === value)
}
