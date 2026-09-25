# 08 — PLATAFORMA DE STREAMING E VÍDEOS BÍBLICOS

O módulo de streaming do **COM DEUS KIDS** proporciona uma experiência de vídeo cristã segura, alegre e livre de anúncios invasivos ou conteúdos inapropriados.

---

## 1. Tipos de Conteúdo em Vídeo (`stream_contents`)

Cada item cadastrado no CMS do ADM possui uma tipologia clara:

* **Filmes (`movie`)**: Longa-metragens ou animações bíblicas completas (ex: *A História de Davi*, *O Nascimento de Jesus*).
* **Séries (`series`)**: Produções episódicas com temporadas e múltiplos capítulos.
* **Episódios (`episode`)**: Capítulos individuais pertencentes a uma temporada de série.
* **Histórias Bíblicas (`story`)**: Contações de histórias animadas ou narradas para hora de dormir ou devocional diário.
* **Clipes & Reels (`clip`)**: Vídeos curtos e dinâmicos para momentos de louvor e dança infantil.
* **Lições Bíblicas (`lesson`)**: Aulas guiadas com versículo para memorização e devocional.

---

## 2. Estrutura de Séries e Temporadas

Para produções com múltiplos episódios, o banco de dados organiza as tabelas de forma relacional:

```text
stream_contents (type = 'series')
  └── stream_series_seasons (Temporada 1, Temporada 2...)
        └── stream_episodes (Episódio 1, Episódio 2, Episódio 3...)
```

### Campos do Episódio:
- `episode_number`: Ordem cronológica da história.
- `title`: Título do episódio.
- `thumbnail_url`: Imagem de capa widescreen (16:9).
- `video_url`: URL do stream (HLS / MP4 seguro / Mux / Vimeo OTT / Cloudflare Stream).
- `scripture_verse`: Versículo-chave abordado no episódio.
- `devotional_text`: Aplicação prática para os pais conversarem com os filhos.

---

## 3. Progresso por Perfil (`profile_watch_progress`)

O recurso "Continuar Assistindo" opera de maneira estritamente isolada por **Perfil Infantil (`account_profiles`)**:

```sql
CREATE TABLE public.profile_watch_progress (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id       UUID NOT NULL REFERENCES public.account_profiles(id) ON DELETE CASCADE,
  content_id       TEXT NOT NULL,
  content_title    TEXT,
  content_thumbnail TEXT,
  progress_seconds INTEGER DEFAULT 0,
  duration_seconds INTEGER DEFAULT 0,
  completed        BOOLEAN DEFAULT FALSE,
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (profile_id, content_id)
);
```

### Regras de Negócio:
1. **Isolamento de Irmãos**: Se o filho de 8 anos assistiu 80% do episódio 3 de *Moisés*, a irmã de 4 anos no perfil dela começa do início, sem ter seu progresso misturado.
2. **Conclusão Automática**: Quando o vídeo atinge mais de 90% de execução, o campo `completed` é marcado como `true`.
3. **Card na Home**: A seção "Continuar Assistindo" na Home do APP prioriza conteúdos com `completed = false` e `progress_seconds > 10`.

---

## 4. O Player Cinematográfico (`WatchPlayer.tsx`)

* **Imersão Total**: Executa em tela cheia com fundo preto absoluto.
* **Controles para Crianças**: Botões grandes de play/pause, retroceder 10 segundos e avançar para o próximo episódio.
* **Sem Links Externos**: Não há sugestões de vídeos de plataformas de terceiros ou algoritmos abertos.
* **Versículo na Pausa**: Ao pausar o vídeo, um card sutil pode exibir o versículo bíblico da lição.

---

## 5. Experiência Web para Smart TV (`/tv/*`)

Para famílias que conectam o navegador da TV da sala (LG webOS, Samsung Tizen, Android TV), o APP oferece uma interface especializada em **10-Foot UI**:

* **Detecção Automática (`isSmartTVBrowser`)**: Redireciona a TV para a rota `/tv`.
* **Navegação por Controle Remoto**: Suporte completo a navegação pelas teclas direcionais (`ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`) e seleção pela tecla `Enter/OK`.
* **Autenticação por Código (Pairing)**: A TV exibe um código de 6 dígitos para o pai autorizar o acesso pelo celular em `https://comdeuskids.com.br/tv-auth`, dispensando a digitação de senhas longas com o controle remoto.
