# 07 — ÁREA DE MEMBROS E BIBLIOTECA DIGITAL

A **Área de Membros** opera dentro do **APP (`apps/app`)**, oferecendo aos clientes pagantes uma experiência centralizada e organizada para acessar seus materiais digitais.

---

## 1. Experiência de Acesso do Cliente

Após efetuar login (`/login` no APP), o cliente tem acesso à sua central de materiais:

* **`/biblioteca`**: Visão em grade de todos os produtos comprados e coleções inclusas na assinatura.
* **`/downloads`**: Histórico rápido de arquivos baixados recentemente e atalhos para impressão.
* **`/materiais/:id`** ou **`/material/:id`**: Página de detalhe e consumo do material específico.
* **`/minha-lista`**: Conteúdos favoritados pelo perfil ativo.

---

## 2. A Entrega Multimídia do Produto

No Com Deus Kids, um produto adquirido não é apenas um link frio de download. A página interna do produto (`MaterialDetail.tsx`) entrega uma experiência rica:

1. **Visualizador de PDF Integrado**: A criança ou o educador pode folhear as páginas do material na tela do tablet ou computador sem precisar sair do navegador.
2. **Download em Alta Resolução**: Botão dedicado para baixar o PDF completo configurado para impressão em papel A4 (com sangria e cores nítidas).
3. **Materiais Complementares**: Abas separadas para o "Caderno do Aluno" e o "Guia do Educador / Devocional Familiar".
4. **Mídias Integradas**: Se o material bíblico tiver um vídeo, clipe ou historinha em áudio correspondente, esses recursos aparecem linkados no rodapé da página para enriquecer a aula.
5. **Quiz Bíblico**: Opção de abrir o quiz interativo para testar o que a criança aprendeu com a atividade.

---

## 3. Segurança e Políticas RLS (Row Level Security)

O acesso aos metadados e arquivos de cada material é rigorosamente filtrado pelo Supabase RLS:

```sql
-- Verifica se o usuário tem direito ao arquivo:
CREATE POLICY "product_files: visível com entitlement"
  ON public.product_files FOR SELECT
  USING (
    public.is_admin()
    OR public.has_entitlement(product_id)
    OR EXISTS (
      SELECT 1 FROM public.products p
      WHERE p.id = product_files.product_id AND p.is_free = TRUE
    )
  );
```

### O que acontece se o usuário não possuir acesso?
- O produto aparece na biblioteca com um cadeado sutil.
- Ao clicar, exibe um modal explicativo: *"Este material faz parte do Clube Com Deus Kids. Assine ou adquira avulso para liberar o download imediato."* com botão de redirecionamento para o checkout.

---

## 4. Auditoria de Downloads (`download_logs`)

Toda vez que uma URL assinada é gerada para o cliente baixar um arquivo de alta resolução, o sistema registra um evento em `download_logs`:
* `user_id`: Identificador do usuário que baixou.
* `product_file_id`: O arquivo exato baixado.
* `entitlement_id`: O direito que autorizou o download.
* `ip_address` e `user_agent`: Para identificação de eventuais acessos abusivos ou compartilhamento indevido de conta.
* `downloaded_at`: Data e hora exatas da requisição.
