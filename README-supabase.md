# Configuração do Supabase para Gift Card Haven

Este documento fornece instruções sobre como configurar o Supabase para suportar todas as funcionalidades do Gift Card Haven, incluindo as novas adições como notificações, configurações do sistema e estatísticas de usuários.

## Estrutura do Banco de Dados

O Gift Card Haven utiliza as seguintes tabelas no Supabase:

1. **gift_cards** - Armazena informações sobre os gift cards disponíveis
2. **categories** - Armazena as categorias dos gift cards
3. **gift_card_categories** - Tabela de relacionamento entre gift cards e categorias
4. **exchange_rates** - Armazena as taxas de câmbio para diferentes moedas
5. **sessions** - Rastreia sessões de usuários para estatísticas
6. **notifications** - Armazena notificações do sistema que aparecem no site
7. **settings** - Armazena configurações gerais do sistema

## Passos para Configuração

### 1. Criar um Novo Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com/) e faça login
2. Crie um novo projeto e anote a URL e a chave anônima

### 2. Configurar as Tabelas

No Editor SQL do Supabase, execute o script SQL contido no arquivo `src/lib/supabase.sql`. Este script:

- Cria todas as tabelas necessárias se elas não existirem
- Configura triggers para atualização automática de timestamps
- Cria a função `get_dashboard_stats()` para estatísticas

### 3. Configurar Políticas de Segurança (RLS)

Para proteger seus dados, configure as políticas de Row Level Security:

```sql
-- Permissão para ler gift cards (público)
CREATE POLICY "Gift Cards são públicos" 
ON gift_cards FOR SELECT USING (true);

-- Permissão para ler categorias (público)
CREATE POLICY "Categorias são públicas" 
ON categories FOR SELECT USING (true);

-- Permissão para ler taxas de câmbio (público)
CREATE POLICY "Taxas de câmbio são públicas" 
ON exchange_rates FOR SELECT USING (true);

-- Permissão para ler notificações ativas (público)
CREATE POLICY "Notificações ativas são públicas" 
ON notifications FOR SELECT 
USING (is_active = true AND (expires_at > now() OR expires_at IS NULL));

-- Permissões para administradores (necessita autenticação)
-- Implemente conforme sua estrutura de autenticação
```

### 4. Dados Iniciais

Execute os seguintes scripts para adicionar dados iniciais:

```sql
-- Adicionar taxas de câmbio iniciais
INSERT INTO exchange_rates (currency, rate)
VALUES 
('EUR', 900.00),
('BRL', 200.00),
('USD', 800.00)
ON CONFLICT (currency) DO UPDATE SET rate = EXCLUDED.rate;

-- Adicionar configurações iniciais do sistema
INSERT INTO settings (
  site_name, site_description, contact_email, whatsapp_number, 
  enable_notifications, maintenance_mode, default_currency
) VALUES (
  'Gift Card Haven', 
  'Compre gift cards internacionais com facilidade',
  'contato@giftcardhaven.com',
  '+244 931343433',
  true,
  false,
  'AOA'
)
ON CONFLICT (id) DO NOTHING;
```

### 5. Configuração de Armazenamento

Para permitir o upload de imagens dos gift cards:

1. Crie um novo bucket chamado `gift-cards`
2. Configure a política de acesso para permitir leitura pública
3. Configure o upload para aceitar apenas imagens (mimetypes: image/*)

```sql
-- Política para permitir visualização pública de imagens
CREATE POLICY "Imagens são públicas" 
ON storage.objects FOR SELECT USING (bucket_id = 'gift-cards');

-- Política para permitir upload por administradores (ajuste conforme sua autenticação)
CREATE POLICY "Admins podem fazer upload" 
ON storage.objects FOR INSERT 
USING (bucket_id = 'gift-cards' AND auth.role() = 'authenticated');
```

### 6. Configuração do Cliente

No seu arquivo `.env.local` ou equivalente, configure:

```
NEXT_PUBLIC_SUPABASE_URL=sua_url_do_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

## Testes e Verificação

Após a configuração, execute estas consultas para verificar:

```sql
-- Verificar tabelas
SELECT * FROM gift_cards LIMIT 5;
SELECT * FROM categories LIMIT 5;
SELECT * FROM exchange_rates;
SELECT * FROM notifications;
SELECT * FROM settings;

-- Testar a função de estatísticas
SELECT get_dashboard_stats();
```

## Manutenção e Monitoramento

- Monitore o uso do banco de dados no painel do Supabase
- Considere configurar backups regulares
- Verifique periodicamente as políticas de segurança

## Solução de Problemas

Se encontrar problemas:

1. Verifique os logs no painel do Supabase
2. Confirme se todas as tabelas foram criadas corretamente
3. Verifique se as políticas de RLS estão permitindo o acesso necessário
4. Teste as consultas diretamente no Editor SQL antes de diagnosticar problemas no código 