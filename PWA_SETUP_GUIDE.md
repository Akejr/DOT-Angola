# 📱 Guia Completo: PWA Gift Card Haven Admin

## 🚀 **PWA TOTALMENTE CONFIGURADA COM NOTIFICAÇÕES PUSH**

Este guia explica como usar a PWA (Progressive Web App) do admin com notificações automáticas.

---

## 📋 **Passo 1: Execute o Script SQL no Supabase**

1. **Abra o Supabase SQL Editor**
2. **Execute o script**: `supabase/migrations/pwa_push_subscriptions.sql`
3. **Execute também**: `supabase/migrations/final_dashboard_fix.sql` (se ainda não executou)

### 🎯 **O que os scripts fazem:**

- ✅ Cria tabela `push_subscriptions` para notificações
- ✅ Cria função `get_daily_sales_stats()` para relatórios
- ✅ Configura todas as tabelas de analytics
- ✅ Políticas de segurança configuradas

---

## 📱 **Passo 2: Instalar a PWA**

### **No iPhone/iPad:**
1. Abra Safari e acesse `/admin`
2. Toque no botão **"Compartilhar"** (ícone de seta para cima)
3. Role para baixo e toque em **"Adicionar à Tela de Início"**
4. Confirme tocando em **"Adicionar"**

### **No Android:**
1. Abra Chrome e acesse `/admin`
2. Toque nos **3 pontos** no canto superior direito
3. Toque em **"Adicionar à tela inicial"**
4. Confirme tocando em **"Adicionar"**

### **No Desktop:**
1. Abra Chrome/Edge e acesse `/admin`
2. Clique no **ícone de instalação** na barra de endereços
3. Ou use o botão **"Instalar App"** no sidebar do admin

---

## 🔔 **Passo 3: Ativar Notificações**

### **Primeira vez:**
1. **Faça login** no admin
2. No **sidebar esquerdo**, clique em **"Ativar Notificações"**
3. **Permita** quando o navegador solicitar
4. Você verá uma **notificação de teste** confirmando

### **Notificações Automáticas:**
- 💰 **Nova Venda**: Sempre que alguém comprar algo
- 📊 **Relatório Diário**: Todos os dias às **20:00** com lucro do dia

---

## 🎛️ **Funcionalidades da PWA**

### **📊 Dashboard Analytics**
- **Usuários Online** (últimos 5 minutos)
- **Sessões Únicas** por período
- **Páginas Mais Acessadas** com ranking dinâmico
- **Atualização automática** a cada 30 segundos

### **🔔 Sistema de Notificações**
- **Notificações Push** nativas do iOS/Android
- **Som e vibração** personalizados
- **Ações rápidas** (Abrir Admin / Fechar)
- **Funciona offline** com service worker

### **📱 Experiência Nativa**
- **Ícone na tela inicial** com logo da empresa
- **Splash screen** personalizada
- **Funciona offline** para páginas visitadas
- **Atualização automática** quando há mudanças

---

## 🧪 **Teste das Notificações**

### **Teste Manual:**
1. No admin, clique no botão **"🧪 Testar Notificação"** (modo desenvolvimento)
2. Você deve receber uma notificação imediatamente

### **Teste de Venda:**
1. Registre uma nova venda no sistema
2. Você deve receber notificação automática com:
   - Nome do cliente
   - Valor da venda em AOA

### **Teste de Relatório Diário:**
- Aguarde até às **20:00** ou
- Modifique o horário no `sw.js` para testar

---

## 🔧 **Configurações Avançadas**

### **Personalizar Horário do Relatório:**
No arquivo `public/sw.js`, linha 200:
```javascript
targetTime.setHours(20, 0, 0, 0); // 20:00 (8 PM)
```

### **Personalizar Mensagens:**
No arquivo `src/lib/pwa.ts`, função `handleNewSale()`:
```typescript
title: '💰 Nova Venda Registrada!',
body: `${sale.customer_name} - ${totalFormatted}`,
```

### **Adicionar Mais Notificações:**
```typescript
// Exemplo: notificar quando estoque baixo
await showNotification({
  title: '⚠️ Estoque Baixo',
  body: 'Produto X tem apenas 2 unidades',
  requireInteraction: true
});
```

---

## 📊 **Monitoramento**

### **Verificar Subscriptions Ativas:**
```sql
SELECT count(*) FROM push_subscriptions;
SELECT * FROM push_subscriptions ORDER BY created_at DESC;
```

### **Estatísticas de Vendas:**
```sql
SELECT get_daily_sales_stats(); -- Hoje
SELECT get_daily_sales_stats('2024-01-15'); -- Data específica
```

### **Limpeza Automática:**
```sql
SELECT cleanup_old_push_subscriptions(); -- Remove subscriptions antigas
```

---

## 🚨 **Resolução de Problemas**

### **Notificações não chegam:**
1. Verifique se as permissões estão ativadas no navegador
2. Confirme que o service worker está registrado
3. Teste com o botão de teste manual

### **PWA não instala:**
1. Certifique-se que está usando HTTPS
2. Verifique se o manifest.json está acessível
3. Confirme que todos os ícones existem

### **Service Worker não funciona:**
1. Abra DevTools → Application → Service Workers
2. Clique em "Unregister" e recarregue a página
3. Verifique erros no console

---

## 📱 **Compatibilidade**

### **✅ Suportado:**
- **iOS Safari** 11.3+
- **Android Chrome** 40+
- **Desktop Chrome** 40+
- **Desktop Edge** 79+
- **Desktop Firefox** 44+

### **❌ Limitações:**
- **iOS**: Notificações push limitadas
- **Firefox**: Algumas funcionalidades PWA limitadas

---

## 🎉 **Resultado Final**

Após seguir este guia, você terá:

✅ **PWA instalável** no iPhone/Android  
✅ **Notificações automáticas** de vendas  
✅ **Relatório diário** às 20:00  
✅ **Dashboard em tempo real**  
✅ **Funciona offline**  
✅ **Ícone personalizado** na tela inicial  
✅ **Experiência nativa** completa  

**A PWA está pronta para uso profissional! 🚀** 