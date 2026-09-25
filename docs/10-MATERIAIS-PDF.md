# 10 — MATERIAIS EM PDF E ATIVIDADES PARA IMPRIMIR

Os materiais impressos em PDF (atividades, cadernos de colorir, jogos de tabuleiro em papel e devocionais) são o principal produto físico/digital comercializado no **COM DEUS KIDS**.

---

## 1. A Dualidade: PDF de Preview vs. PDF Integral Protegido

Para proteger a propriedade intelectual e ao mesmo tempo converter visitantes em compradores, o sistema opera com dois formatos distintos de entrega:

| Tipo | Onde Fica | Onde é Usado | Como é Acessado | Finalidade |
| :--- | :--- | :--- | :--- | :--- |
| **PDF de Preview** *(Degustação)* | Bucket `product-covers` ou Storage Público | **SITE** (`apps/site`) na página `/produto/:slug` | URL pública direta ou renderizado em imagens WebP | Permitir que os pais folheiem 2 ou 3 páginas de amostra antes de comprar. |
| **PDF Integral** *(Produto Real)* | Bucket `product-files` (**Privado**) | **APP** (`apps/app`) na rota `/materiais/:id` | URL assinada temporária (`createSignedUrl`) | Entrega do caderno completo em 300 DPI pronto para imprimir em folha A4. |

---

## 2. Experiência de Consumo no APP (`MaterialDetail.tsx`)

Na área autenticada do membro:

1. **Leitor Integrado (PDF Viewer)**:
   - Permite visualizar o material diretamente no navegador sem exigir download obrigatório.
   - Ideal para quem utiliza o tablet para acompanhar a lição com a criança.
2. **Botão de Download Autorizado**:
   - Gera um link com tempo de vida limitado (ex: 60 minutos).
   - O arquivo baixa com o nome oficial configurado no CMS (ex: `ComDeusKids_Caderno_Colorir_Herois_da_Fe.pdf`).
3. **Versão do Professor / Família (`is_teacher = true`)**:
   - Permite disponibilizar anexos extras com roteiro da aula bíblica, perguntas de reflexão e versículos complementares para os educadores.

---

## 3. Arquitetura de Armazenamento Seguro no Supabase

```sql
-- Bucket PRIVADO para arquivos completos
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'product-files', 
  'product-files', 
  FALSE,             -- ATENÇÃO: Nunca defina como TRUE!
  52428800,          -- Limite de 50MB por arquivo
  ARRAY['application/pdf', 'application/zip']
)
ON CONFLICT (id) DO NOTHING;
```

### Regra de Ouro contra Vazamentos:
* É estritamente proibido salvar o arquivo integral de um material pago no bucket público `product-covers`.
* O frontend jamais deve receber o link absoluto do Storage sem assinatura criptográfica temporária.
