# 09 — MÚSICAS, LOUVORES E ÁUDIO PERSISTENTE

O módulo de áudio do **COM DEUS KIDS** atende às famílias que desejam um ambiente musical cristão constante no dia a dia dos pequenos (durante brincadeiras, no carro ou na hora de dormir).

---

## 1. Estrutura do Módulo Musical

* **Rotas Públicas no APP**: `/musicas`, `/louvores`, `/player-musical`.
* **Entidades Principais**:
  - **Músicas (`song`)**: Faixa individual com título, áudio URL, artista, letra e duração.
  - **Álbuns**: Coleções de faixas do mesmo tema ou projeto musical.
  - **Playlists Temáticas**: Agrupamentos editoriais como *"Hora do Soninho"*, *"Louvor Animado para Pular"*, *"Cânticos de Memorização Bíblica"*.
  - **Letras e Karaokê**: Exibição da letra sincronizada para a família cantar junta.

---

## 2. Regra Fundamental: Player de Áudio Global Persistente

> **REGRA ARQUITETURAL INEGOCIÁVEL**:
> Uma música iniciada na aba `/musicas` **nunca deve parar de tocar** quando o usuário navegar internamente pelo APP (por exemplo, ao ir para a Home, abrir uma atividade em PDF ou conferir seus perfis).

### Implementação Técnica:
1. O elemento HTML5 `<audio>` e o contexto de reprodução devem residir no **Shell Global da aplicação** (`StreamLayout.tsx` ou `AudioPlayerContext.tsx`), acima das rotas que sofrem transição no `Outlet`.
2. A navegação interna via React Router (`navigate` ou `<Link>`) troca apenas a camada de visualização sem desmontar o nó de áudio.

---

## 3. Os Dois Modos do Player

### A. Docked Bottom Player (Player Inferior Dockado)
* Fica afixado no rodapé da aplicação, acima da barra de navegação mobile.
* Exibe:
  - Capa miniatura em miniatura (44x44px).
  - Título da canção e nome do projeto/artista.
  - Botão de Play / Pause.
  - Botão de Próxima Faixa.
  - Barra de progresso horizontal fina no topo da barra.
  - Botão de expandir para o modo completo.

### B. Fullscreen Player (Player Expandido)
* Abre como um modal ou drawer sobreposto.
* Exibe:
  - Capa do álbum em destaque central (com cantos arredondados e sombra suave).
  - Barra de progresso interativa com tempo decorrido e tempo restante.
  - Controles completos: Voltar faixa, Retroceder 15s, Play/Pause, Avançar 15s, Próxima faixa.
  - Botões de **Shuffle** (ordem aleatória) e **Repeat** (repetir música/playlist).
  - Aba de **Fila de Reprodução (Queue)** com opção de reordenar músicas.
  - Aba de **Letra da Canção (Lyrics)** para acompanhamento e aprendizado das palavras.

---

## 4. Integração com o Sistema Operacional (Media Session API)

Sempre que uma faixa for iniciada, a aplicação deve alimentar a **Media Session API**:

```javascript
if ('mediaSession' in navigator) {
  navigator.mediaSession.metadata = new MediaMetadata({
    title: currentSong.title,
    artist: currentSong.artist || 'Com Deus Kids',
    album: currentSong.album || 'Louvores Infantis',
    artwork: [
      { src: currentSong.thumbnail_url, sizes: '512x512', type: 'image/png' }
    ]
  });

  navigator.mediaSession.setActionHandler('play', () => audioContext.play());
  navigator.mediaSession.setActionHandler('pause', () => audioContext.pause());
  navigator.mediaSession.setActionHandler('previoustrack', () => audioContext.prev());
  navigator.mediaSession.setActionHandler('nexttrack', () => audioContext.next());
}
```

Isso garante que:
- O pai ou a mãe possa controlar a música pela tela de bloqueio do smartphone.
- O controle de mídia de fones Bluetooth e do painel do carro funcione nativamente.
- O áudio continue em segundo plano enquanto a tela do celular estiver desligada.
