import { StreamContent } from '@comdeuskids/types'

export const STREAM_CATALOG: StreamContent[] = [
  // 1. Destaque Principal: Davi e Golias
  {
    id: 'davi-golias',
    title: 'Davi e Golias: A Força da Fé',
    slug: 'davi-e-golias',
    description: 'Uma história de coragem, fé inabalável e a certeza de que nenhum gigante resiste ao amor e poder de Deus. Com apenas uma funda e pedrinhas, o jovem pastor vence o desafio.',
    type: 'movie',
    category: 'Histórias Bíblicas',
    tags: ['Coragem', 'Fé', 'Milagres', 'Pastor'],
    thumbnail_url: '/posters/davi_vertical.png',
    banner_url: '/banners/hero_davi_golias.jpg',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration_minutes: 45,
    age_range: 'Livre',
    is_featured: true,
    is_new: true,
    scripture_verse: '1 Samuel 17:45 — "Você vem contra mim com espada e lança, mas eu vou contra você em nome do Senhor dos Exércitos!"',
    devotional_text: 'Quando enfrentamos problemas que parecem gigantes, não precisamos ter medo. Deus está sempre ao nosso lado nos dando coragem!',
    related_pdf_id: 'mat-2',
    related_pdf_title: 'Davi & Golias - Kit Infantil de Colorir & Estudo',
    related_pdf_pages: 16,
    quiz: [
      {
        question: 'O que o jovem Davi cuidava antes de enfrentar o gigante?',
        options: ['De um exército', 'Das ovelhas do seu pai', 'De um navio', 'De uma plantação'],
        correct_index: 1,
        explanation: 'Davi era um pastor dedicado que cuidava com amor das ovelhinhas do pai!'
      },
      {
        question: 'Quantas pedrinhas lisas Davi escolheu no ribeiro?',
        options: ['1 pedrinha', '3 pedrinhas', '5 pedrinhas', '12 pedrinhas'],
        correct_index: 2,
        explanation: 'Davi pegou 5 pedras lisas no riacho para colocar em sua sacola.'
      },
      {
        question: 'Em nome de quem Davi venceu a batalha?',
        options: ['Em nome do Rei', 'Em seu próprio nome', 'Em nome do Senhor dos Exércitos', 'Em nome dos soldados'],
        correct_index: 2,
        explanation: 'Davi confiou inteiramente no poder do Deus Todo-Poderoso!'
      }
    ]
  },

  // 2. A Arca de Noé (Série 3D Oficial)
  {
    id: 'arca-de-noe',
    title: 'A Arca de Noé',
    slug: 'a-arca-de-noe',
    description: 'A jornada épica de fé e obediência de Noé e sua família. Diante do impossível, uma promessa eterna que atravessa gerações e ensina o cuidado incondicional de Deus.',
    type: 'series',
    category: 'Histórias Bíblicas',
    tags: ['Série 3D', 'Família & Fé', 'Obediência', 'Animais'],
    thumbnail_url: '/thumbnails/noe.jpg',
    banner_url: '/banners/arca_noe_banner.jpg',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration_minutes: 25,
    age_range: 'Livre',
    is_featured: true,
    is_new: false,
    season_count: 2,
    seasons: [
      {
        id: 'season-noe-1',
        season_number: 1,
        title: 'Temporada 1 (5 Episódios)',
        episodes: [
          {
            id: 'ep-noe-1',
            episode_number: 1,
            season_number: 1,
            title: 'O Chamado',
            duration_minutes: 22,
            thumbnail_url: '/thumbnails/noe_ep1.jpg',
            synopsis: 'A ordem divina e a fé inabalável em tempos difíceis. Noé ouve a voz do Criador e prepara sua família.',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
          },
          {
            id: 'ep-noe-2',
            episode_number: 2,
            season_number: 1,
            title: 'Construindo a Arca',
            duration_minutes: 24,
            thumbnail_url: '/thumbnails/noe_ep2.jpg',
            synopsis: 'O trabalho em equipe da família e a fidelidade ao projeto de Deus mesmo diante de zombarias.',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
          },
          {
            id: 'ep-noe-3',
            episode_number: 3,
            season_number: 1,
            title: 'Promessas de Deus',
            duration_minutes: 25,
            thumbnail_url: '/thumbnails/noe_ep3.jpg',
            synopsis: 'Os animais entram aos pares, a chuva torrencial começa e a arca flutua segura no cuidado divino.',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
          },
          {
            id: 'ep-noe-4',
            episode_number: 4,
            season_number: 1,
            title: 'O Dilúvio & Esperança',
            duration_minutes: 23,
            thumbnail_url: '/thumbnails/noe_ep4.jpg',
            synopsis: 'A arca navega pelas águas e Noé solta a pomba com o ramo de oliveira, anunciando a paz na terra.',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4'
          },
          {
            id: 'ep-noe-5',
            episode_number: 5,
            season_number: 1,
            title: 'Um Novo Começo',
            duration_minutes: 26,
            thumbnail_url: '/thumbnails/noe_ep5.jpg',
            synopsis: 'As águas baixam, o altar de agradecimento é erguido e o grande arco-íris da aliança eterna ilumina o mundo.',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'
          }
        ]
      },
      {
        id: 'season-noe-2',
        season_number: 2,
        title: 'Temporada 2 (5 Episódios)',
        episodes: [
          {
            id: 'ep-noe-6',
            episode_number: 1,
            season_number: 2,
            title: 'A Grande Aliança',
            duration_minutes: 25,
            thumbnail_url: '/thumbnails/noe_ep1.jpg',
            synopsis: 'O pacto de proteção divina e a bênção sobre a nova terra que floresce sob a graça.',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
          },
          {
            id: 'ep-noe-7',
            episode_number: 2,
            season_number: 2,
            title: 'O Pouso no Monte Ararate',
            duration_minutes: 24,
            thumbnail_url: '/thumbnails/noe_ep2.jpg',
            synopsis: 'A terra seca começa a surgir com beleza renovada e as portas da arca se preparam para abrir.',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
          },
          {
            id: 'ep-noe-8',
            episode_number: 3,
            season_number: 2,
            title: 'A Primeira Colheita',
            duration_minutes: 22,
            thumbnail_url: '/thumbnails/noe_ep3.jpg',
            synopsis: 'Trabalho, gratidão e a redescoberta dos frutos da terra sob o cuidado e fartura de Deus.',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
          },
          {
            id: 'ep-noe-9',
            episode_number: 4,
            season_number: 2,
            title: 'O Cântico de Gratidão',
            duration_minutes: 25,
            thumbnail_url: '/thumbnails/noe_ep4.jpg',
            synopsis: 'Toda a família reunida em adoração sincera e cânticos de celebração com toda a criação.',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4'
          },
          {
            id: 'ep-noe-10',
            episode_number: 5,
            season_number: 2,
            title: 'O Legado da Fé',
            duration_minutes: 27,
            thumbnail_url: '/thumbnails/noe_ep5.jpg',
            synopsis: 'As grandes lições de Noé são transmitidas com amor às novas gerações como testemunho eterno.',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'
          }
        ]
      }
    ],
    episodes: [
      {
        id: 'ep-noe-1',
        episode_number: 1,
        season_number: 1,
        title: 'O Chamado',
        duration_minutes: 22,
        thumbnail_url: '/thumbnails/noe_ep1.jpg',
        synopsis: 'A ordem divina e a fé inabalável em tempos difíceis. Noé ouve a voz do Criador e prepara sua família.',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
      },
      {
        id: 'ep-noe-2',
        episode_number: 2,
        season_number: 1,
        title: 'Construindo a Arca',
        duration_minutes: 24,
        thumbnail_url: '/thumbnails/noe_ep2.jpg',
        synopsis: 'O trabalho em equipe da família e a fidelidade ao projeto de Deus mesmo diante de zombarias.',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
      },
      {
        id: 'ep-noe-3',
        episode_number: 3,
        season_number: 1,
        title: 'Promessas de Deus',
        duration_minutes: 25,
        thumbnail_url: '/thumbnails/noe_ep3.jpg',
        synopsis: 'Os animais entram aos pares, a chuva torrencial começa e a arca flutua segura no cuidado divino.',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
      },
      {
        id: 'ep-noe-4',
        episode_number: 4,
        season_number: 1,
        title: 'O Dilúvio & Esperança',
        duration_minutes: 23,
        thumbnail_url: '/thumbnails/noe_ep4.jpg',
        synopsis: 'A arca navega pelas águas e Noé solta a pomba com o ramo de oliveira, anunciando a paz na terra.',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4'
      },
      {
        id: 'ep-noe-5',
        episode_number: 5,
        season_number: 1,
        title: 'Um Novo Começo',
        duration_minutes: 26,
        thumbnail_url: '/thumbnails/noe_ep5.jpg',
        synopsis: 'As águas baixam, o altar de agradecimento é erguido e o grande arco-íris da aliança eterna ilumina o mundo.',
        video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'
      }
    ],
    scripture_verse: 'Gênesis 9:13 — "Porei o meu arco nas nuvens, e ele será o sinal da aliança entre mim e a terra."',
    devotional_text: 'Deus nunca quebra uma promessa. Quando vemos o arco-íris, lembramos do Seu amor fiel e de Sua proteção.',
    related_pdf_id: 'mat-4',
    related_pdf_title: 'Kit de Colorir e Labirintos - A Arca de Noé',
    related_pdf_pages: 32,
    quiz: [
      {
        question: 'Quantos dias e noites durou a grande chuva do dilúvio?',
        options: ['7 dias', '12 dias', '40 dias e 40 noites', '100 dias'],
        correct_index: 2,
        explanation: 'A chuva caiu por 40 dias e 40 noites, mas a arca flutuou em segurança.'
      },
      {
        question: 'Qual ave voltou para a arca trazendo uma folha de oliveira no bico?',
        options: ['Uma águia', 'Uma pombinha', 'Um corvo', 'Um pardal'],
        correct_index: 1,
        explanation: 'A pombinha trouxe a folhinha de oliveira mostrando que as águas já tinham baixado!'
      },
      {
        question: 'Qual é o sinal que Deus colocou no céu como promessa de paz?',
        options: ['Uma estrela cadente', 'O arco-íris', 'Uma nuvem dourada', 'O vento forte'],
        correct_index: 1,
        explanation: 'O arco-íris nos céus é o lindo sinal da aliança eterna de Deus com a terra!'
      }
    ]
  },

  // 2B. Histórias de Davi: Do Campo ao Trono (Série 3D Oficial)
  {
    id: 'historias-de-davi',
    title: 'Histórias de Davi: Do Campo ao Trono',
    slug: 'historias-de-davi',
    description: 'Acompanhe a trajetória de Davi desde os dias de pastorzinho enfrentando ursos e leões, a vitória sobre Golias, a amizade com Jônatas até a consagração como rei de Israel.',
    type: 'series',
    category: 'Histórias Bíblicas',
    tags: ['Série 3D', 'Coragem', 'Adoração', 'Liderança'],
    thumbnail_url: '/posters/davi_vertical.png',
    banner_url: '/banners/hero_davi_golias.jpg',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration_minutes: 24,
    age_range: 'Livre',
    is_featured: true,
    is_new: true,
    season_count: 2,
    seasons: [
      {
        id: 'season-davi-1',
        season_number: 1,
        title: 'Temporada 1: O Jovem Pastor',
        episodes: [
          {
            id: 'ep-davi-1',
            episode_number: 1,
            season_number: 1,
            title: 'O Coração Escolhido',
            duration_minutes: 22,
            thumbnail_url: '/posters/davi_vertical.png',
            synopsis: 'Samuel visita a casa de Jessé em Belém e o menor dos irmãos é ungido pelo Senhor.',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'
          },
          {
            id: 'ep-davi-2',
            episode_number: 2,
            season_number: 1,
            title: 'O Leão e o Urso',
            duration_minutes: 24,
            thumbnail_url: '/posters/davi_vertical.png',
            synopsis: 'Protegendo o rebanho do pai com coragem e aprendendo a confiar no livramento de Deus.',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
          },
          {
            id: 'ep-davi-3',
            episode_number: 3,
            season_number: 1,
            title: 'A Harpa da Paz',
            duration_minutes: 23,
            thumbnail_url: '/posters/davi_vertical.png',
            synopsis: 'Os louvores inspirados de Davi trazem consolo e paz ao palácio do rei Saul.',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4'
          },
          {
            id: 'ep-davi-4',
            episode_number: 4,
            season_number: 1,
            title: 'Frente a Frente com o Gigante',
            duration_minutes: 26,
            thumbnail_url: '/posters/davi_vertical.png',
            synopsis: 'A fé em Deus derrota o gigante Golias e liberta todo o povo com grande júbilo.',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
          }
        ]
      },
      {
        id: 'season-davi-2',
        season_number: 2,
        title: 'Temporada 2: O Rei Ungido',
        episodes: [
          {
            id: 'ep-davi-5',
            episode_number: 1,
            season_number: 2,
            title: 'A Aliança de Jônatas',
            duration_minutes: 24,
            thumbnail_url: '/posters/davi_vertical.png',
            synopsis: 'Uma das mais belas amizades da Bíblia firmada sob a proteção e fidelidade a Deus.',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4'
          },
          {
            id: 'ep-davi-6',
            episode_number: 2,
            season_number: 2,
            title: 'A Arca em Jerusalém',
            duration_minutes: 25,
            thumbnail_url: '/posters/davi_vertical.png',
            synopsis: 'Davi dança e celebra a chegada da Arca da Aliança à Cidade Santa com todo o povo.',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4'
          }
        ]
      }
    ],
    scripture_verse: '1 Samuel 16:7 — "O homem olha para a aparência, mas o Senhor olha para o coração."',
    devotional_text: 'Deus conhece o que está dentro do nosso coração. Ele ama quem é humilde, fiel e cheio de amor!'
  },

  // 2C. Milagres de Jesus (Série 3D)
  {
    id: 'milagres-de-jesus',
    title: 'Milagres de Jesus: Histórias de Amor',
    slug: 'milagres-de-jesus',
    description: 'Testemunhe o poder extraordinário e a bondade infinita de Jesus acalmando tempestades, multiplicando pães e peixes e acolhendo os pequeninos com ternura.',
    type: 'series',
    category: 'Novo Testamento',
    tags: ['Série 3D', 'Amor', 'Milagres', 'Fé'],
    thumbnail_url: '/thumbnails/criacao.jpg',
    banner_url: '/banners/arca_noe_banner.jpg',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    duration_minutes: 22,
    age_range: 'Livre',
    is_featured: false,
    is_new: true,
    season_count: 1,
    seasons: [
      {
        id: 'season-jesus-1',
        season_number: 1,
        title: 'Temporada 1: Sinais do Reino',
        episodes: [
          {
            id: 'ep-jesus-1',
            episode_number: 1,
            season_number: 1,
            title: 'Acalmando a Tempestade',
            duration_minutes: 21,
            thumbnail_url: '/thumbnails/criacao.jpg',
            synopsis: 'No meio das ondas revoltas, a voz de Jesus traz calmaria e paz sobre as águas.',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4'
          },
          {
            id: 'ep-jesus-2',
            episode_number: 2,
            season_number: 1,
            title: 'A Multiplicação dos Pães',
            duration_minutes: 23,
            thumbnail_url: '/thumbnails/criacao.jpg',
            synopsis: 'O lanchinho do menino com 5 pães e 2 peixes alimenta uma multidão com fartura.',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4'
          },
          {
            id: 'ep-jesus-3',
            episode_number: 3,
            season_number: 1,
            title: 'Deixai Vir a Mim as Crianças',
            duration_minutes: 20,
            thumbnail_url: '/thumbnails/criacao.jpg',
            synopsis: 'Jesus abençoa os pequeninos e ensina que deles é o Reino dos Céus.',
            video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4'
          }
        ]
      }
    ],
    scripture_verse: 'Mateus 19:14 — "Jesus disse: Deixai vir a mim as criancinhas, e não as impeçais, porque de tais é o reino dos céus."',
    devotional_text: 'Jesus tem um carinho especial por você! Ele escuta as suas orações e está sempre pertinho.'
  },

  // 3. Daniel na Cova dos Leões
  {
    id: 'daniel-covas',
    title: 'Daniel na Cova dos Leões',
    slug: 'daniel-na-cova-dos-leoes',
    description: 'Mesmo proibido de orar, Daniel permaneceu fiel a Deus 3 vezes ao dia. Na cova escura, Deus enviou o Seu anjo e fechou a boca dos leões famintos.',
    type: 'story',
    category: 'Histórias Bíblicas',
    tags: ['Oração', 'Fidelidade', 'Proteção'],
    thumbnail_url: '/thumbnails/daniel.jpg',
    banner_url: '/thumbnails/daniel.jpg',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    duration_minutes: 20,
    age_range: 'Livre',
    is_featured: false,
    is_new: true,
    scripture_verse: 'Daniel 6:22 — "O meu Deus enviou o seu anjo e fechou a boca dos leões, para que não me fizessem dano algum."',
    devotional_text: 'A oração tem muito poder! Fale com o Papai do Céu todos os dias, pois Ele ouve a sua voz.'
  },

  // 4. Jesus e a Tempestade
  {
    id: 'jesus-tempestade',
    title: 'Jesus e a Tempestade',
    slug: 'jesus-e-a-tempestade',
    description: 'No meio de ventos uivantes e ondas gigantes no Mar da Galileia, Jesus acorda e com uma só palavra acalma todo o mar. Paz imediata no coração.',
    type: 'story',
    category: 'Aprendendo com Jesus',
    tags: ['Paz', 'Milagres', 'Confiança'],
    thumbnail_url: '/thumbnails/jesus_tempestade.jpg',
    banner_url: '/thumbnails/jesus_tempestade.jpg',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration_minutes: 18,
    age_range: 'Livre',
    is_featured: false,
    is_new: true,
    scripture_verse: 'Marcos 4:39 — "Ele se levantou, repreendeu o vento e disse ao mar: Aquieta-te! Silencia! O vento cessou e fez-se grande calmaria."',
    devotional_text: 'Não importa o tamanho da tempestade, Jesus está sempre no nosso barquinho.'
  },

  // 5. Moisés e o Mar Vermelho
  {
    id: 'moises-mar',
    title: 'Moisés e o Mar Vermelho',
    slug: 'moises-e-o-mar-vermelho',
    description: 'Com o mar à frente e o exército atrás, Moisés estende o cajado e Deus abre um caminho seco no meio das águas para salvar o Seu povo.',
    type: 'story',
    category: 'Histórias Bíblicas',
    tags: ['Livramento', 'Fé', 'Milagres'],
    thumbnail_url: '/thumbnails/moises.jpg',
    banner_url: '/thumbnails/moises.jpg',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration_minutes: 32,
    age_range: 'Livre',
    is_featured: false,
    is_new: false,
    scripture_verse: 'Êxodo 14:14 — "O Senhor pelejará por vós, e vós vos calareis."',
    devotional_text: 'Quando parece que não há saída, Deus faz um caminho onde não havia caminho.'
  },

  // 6. José do Egito: Dos Sonhos ao Palácio
  {
    id: 'jose-egito',
    title: 'José do Egito: Dos Sonhos ao Palácio',
    slug: 'jose-do-egito',
    description: 'A emocionante trajetória de José, que recebeu uma túnica colorida, enfrentou a prisão com integridade e foi honrado por Deus como governador do Egito para salvar sua família.',
    type: 'movie',
    category: 'Histórias Bíblicas',
    tags: ['Perdão', 'Sonhos', 'Propósito'],
    thumbnail_url: '/posters/jose_egito.jpg',
    banner_url: '/posters/jose_egito.jpg',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration_minutes: 38,
    age_range: 'Livre',
    is_featured: false,
    is_new: true,
    scripture_verse: 'Gênesis 50:20 — "Vós bem intentastes mal contra mim; porém Deus o intentou para bem."',
    devotional_text: 'O perdão liberta o coração! José perdoou seus irmãos e viu o propósito lindo de Deus se cumprir.'
  },

  // 7. A Arca da Aliança
  {
    id: 'arca-alianca',
    title: 'A Arca da Aliança: A Presença Sagrada',
    slug: 'a-arca-da-alianca',
    description: 'Descubra os segredos da Arca de Ouro, os querubins brilhantes e o que ela representava como presença constante do Deus Todo-Poderoso junto ao povo de Israel.',
    type: 'story',
    category: 'Histórias Bíblicas',
    tags: ['Santidade', 'Glória', 'Aliança'],
    thumbnail_url: '/posters/arca_alianca.jpg',
    banner_url: '/posters/arca_alianca.jpg',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    duration_minutes: 26,
    age_range: 'Livre',
    is_featured: false,
    is_new: false,
    scripture_verse: 'Êxodo 25:22 — "Ali virei a ti e falarei contigo de cima do propiciatório."',
    devotional_text: 'Deus deseja morar pertinho de você através do Espírito Santo em seu coração.'
  },

  // 8. Milagres de Jesus: A Multiplicação
  {
    id: 'milagres-multiplicacao',
    title: 'Milagres de Jesus: A Multiplicação dos Pães',
    slug: 'multiplicacao-dos-paes',
    description: 'Um menino ofereceu seu lanchinho de 5 pães e 2 peixinhos. Nas mãos abençoadas de Jesus, alimentou mais de 5 mil pessoas com 12 cestos de sobra!',
    type: 'story',
    category: 'Aprendendo com Jesus',
    tags: ['Generosidade', 'Milagres', 'Provisão'],
    thumbnail_url: '/posters/multiplicacao.jpg',
    banner_url: '/posters/multiplicacao.jpg',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration_minutes: 19,
    age_range: 'Livre',
    is_featured: false,
    is_new: true,
    scripture_verse: 'João 6:9 — "Está aqui um rapaz que tem cinco pães de cevada e dois peixinhos; mas que é isto para tantos?"',
    devotional_text: 'Mesmo o que parece pequeno para você se torna gigantesco nas mãos de Jesus!'
  },

  // 9. Jonas e o Grande Peixe
  {
    id: 'jonas-peixe',
    title: 'Jonas & o Grande Peixe',
    slug: 'jonas-e-o-peixe',
    description: 'Jonas tentou fugir, mas no fundo do mar, dentro de um grande peixe preparado por Deus, orou com sinceridade e descobriu a beleza da obediência e da segunda chance.',
    type: 'story',
    category: 'Histórias Bíblicas',
    tags: ['Obediência', 'Misericórdia', 'Mar'],
    thumbnail_url: '/posters/jonas_peixe.jpg',
    banner_url: '/posters/jonas_peixe.jpg',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration_minutes: 25,
    age_range: 'Livre',
    is_featured: false,
    is_new: true,
    scripture_verse: 'Jonas 2:9 — "Do Senhor vem o livramento!"',
    devotional_text: 'Deus é o Deus das segundas chances. Ele sempre nos acolhe quando nos voltamos a Ele.'
  },

  // 10. Rainha Ester
  {
    id: 'rainha-ester',
    title: 'Rainha Ester: Coragem pela Nação',
    slug: 'rainha-ester',
    description: 'Com beleza, sabedoria e muita oração, a jovem Ester arriscou a própria vida diante do Rei persa para salvar todo o seu povo da destruição.',
    type: 'movie',
    category: 'Histórias Bíblicas',
    tags: ['Coragem', 'Realeza', 'Oração'],
    thumbnail_url: '/posters/rainha_ester.jpg',
    banner_url: '/posters/rainha_ester.jpg',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration_minutes: 35,
    age_range: 'Livre',
    is_featured: false,
    is_new: true,
    scripture_verse: 'Ester 4:14 — "E quem sabe se para tal tempo como este chegaste a este reino?"',
    devotional_text: 'Você nasceu com um propósito especial! Deus te colocou onde você está para fazer a diferença.'
  },

  // 11. Sansão, o Forte
  {
    id: 'sansao-forte',
    title: 'Sansão, o Forte: A Verdadeira Força',
    slug: 'sansao-o-forte',
    description: 'Conheça a história do herói que recebeu uma força extraordinária do Espírito de Deus, aprendendo que o verdadeiro poder vem da consagração e humildade diante do Pai.',
    type: 'story',
    category: 'Histórias Bíblicas',
    tags: ['Força', 'Consagração', 'Heróis'],
    thumbnail_url: '/posters/sansao_forte.jpg',
    banner_url: '/posters/sansao_forte.jpg',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    duration_minutes: 28,
    age_range: 'Livre',
    is_featured: false,
    is_new: false,
    scripture_verse: 'Juízes 16:28 — "Ó Senhor Deus, peço-te que te lembres de mim, e fortalece-me só esta vez."',
    devotional_text: 'A verdadeira força dos filhos de Deus vem do Espírito Santo, não dos músculos!'
  },

  // 12. O Bom Samaritano
  {
    id: 'bom-samaritano',
    title: 'O Bom Samaritano: Amor ao Próximo',
    slug: 'o-bom-samaritano',
    description: 'Uma inesquecível parábola de Jesus sobre compaixão, cuidado e amor sem preconceitos na estrada para Jericó.',
    type: 'lesson',
    category: 'Aprendendo com Jesus',
    tags: ['Compaixão', 'Amor', 'Ajudar'],
    thumbnail_url: '/posters/bom_samaritano.jpg',
    banner_url: '/posters/bom_samaritano.jpg',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    duration_minutes: 16,
    age_range: 'Livre',
    is_featured: false,
    is_new: true,
    scripture_verse: 'Lucas 10:37 — "Vai e faze da mesma maneira."',
    devotional_text: 'Amar a Deus é cuidar com carinho daqueles que cruzam o nosso caminho.'
  },

  // 13. Clipe Musical: Louvores do Coração Kids
  {
    id: 'louvores-coracao',
    title: 'Louvores do Coração Kids',
    slug: 'louvores-do-coracao-kids',
    description: 'Cante e dance com a turminha em um lindo louvor de adoração com violões, tamborins e notas musicais coloridas!',
    type: 'clip',
    category: 'Clipes & Músicas',
    tags: ['Música', 'Louvor', 'Alegria', 'Dança'],
    thumbnail_url: '/thumbnails/louvores_coracao.jpg',
    banner_url: '/thumbnails/louvores_coracao.jpg',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    duration_minutes: 4,
    age_range: 'Livre',
    is_featured: false,
    is_new: true,
    scripture_verse: 'Salmos 150:6 — "Tudo o que tem fôlego louve ao Senhor!"',
    devotional_text: 'Cantar e dançar para Jesus enche nossa casa de luz e paz.'
  },

  // 14. Clipe Musical: Cante com Noé!
  {
    id: 'cante-com-noe',
    title: 'Cante com Noé! A Bicharada no Ritmo da Fé',
    slug: 'cante-com-noe',
    description: 'A bicharada reunida na arca batendo os pezinhos e cantando louvores sob o lindo arco-íris de Deus!',
    type: 'clip',
    category: 'Clipes & Músicas',
    tags: ['Animais', 'Ritmo', 'Crianças'],
    thumbnail_url: '/thumbnails/cante_com_noe.jpg',
    banner_url: '/thumbnails/cante_com_noe.jpg',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration_minutes: 3,
    age_range: 'Livre',
    is_featured: false,
    is_new: true,
    scripture_verse: 'Salmos 100:1 — "Celebrai com júbilo ao Senhor, todas as terras!"',
    devotional_text: 'A criação inteira louva ao Criador!'
  },

  // 15. Clipe Musical: Soldadinho de Cristo
  {
    id: 'soldadinho-cristo',
    title: 'Soldadinho de Cristo: A Armadura de Deus',
    slug: 'soldadinho-de-cristo',
    description: 'Um clipe vibrante com a armadura lúdica de Deus: o capacete da salvação, a couraça da justiça e o escudo da fé!',
    type: 'clip',
    category: 'Clipes & Músicas',
    tags: ['Armadura', 'Vitória', 'Marcha'],
    thumbnail_url: '/thumbnails/soldadinho_cristo.jpg',
    banner_url: '/thumbnails/soldadinho_cristo.jpg',
    video_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    duration_minutes: 4,
    age_range: 'Livre',
    is_featured: false,
    is_new: true,
    scripture_verse: 'Efésios 6:11 — "Revesti-vos de toda a armadura de Deus."',
    devotional_text: 'Com a armadura da fé estamos protegidos de todo mal.'
  }
]
