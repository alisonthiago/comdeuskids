---
name: token-saver
description: "Token and credit saver for Google Antigravity. Prevents context window bloat, suppresses verbose tool output, limits file view ranges, avoids dumping whole files, and relies on .antigravityignore."
risk: none
source: community
date_added: "2026-09-25"
---

# Token Saver para Antigravity

Esta skill estabelece diretrizes rigorosas de economia de tokens e créditos durante o desenvolvimento em pares no Antigravity.

## Princípios de Economia de Tokens

### 1. Leitura Cirúrgica de Arquivos
- **Nunca leia arquivos inteiros** sem necessidade. Use sempre fatiamento (`StartLine` e `EndLine`) no `view_file`.
- Visualize apenas blocos de 30 a 80 linhas em torno do trecho relevante.
- Use `grep_search` com termos específicos antes de abrir arquivos.

### 2. Edição Granular
- Use sempre `replace_file_content` com chunks curtos e precisos.
- Nunca reescreva arquivos inteiros com `write_to_file` a menos que seja um arquivo novo.
- Edite apenas os blocos modificados para evitar desperdício de tokens de entrada e saída.

### 3. Supressão de Saídas Verbosas
- Em comandos de terminal (`run_command`), use pipes como `| head -n 30` ou flags silenciosas (`-s`, `-q`, `--silent`).
- Evite executar comandos que despejam milhares de linhas no log do terminal (como `find .` ou dumps de pacotes).

### 4. Proteção de Contexto com `.antigravityignore`
- Mantenha `.antigravityignore` configurado na raiz com `node_modules/`, `dist/`, `.cache/`, `.tempmediaStorage/`, builds e logs ignorados.

### 5. Respostas Concisas
- Vá direto ao ponto, evitando introduções genéricas ou re-explicações redundantes de código já visível.
- Responda de forma densa e estruturada.
