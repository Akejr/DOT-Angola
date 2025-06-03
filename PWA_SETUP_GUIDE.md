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
1. Abra **Safari** e acesse `/admin`
2. Toque no botão **"Compartilhar"** (ícone de seta para cima)
3. Role para baixo e toque em **"Adicionar à Tela de Início"**
4. Confirme tocando em **"Adicionar"**

### **No Android:**
1. Abra **Chrome** e acesse `/admin`
2. Toque nos **3 pontos** no canto superior direito
3. Toque em **"Adicionar à tela inicial"**
4. Confirme tocando em **"Adicionar"**

### **No Desktop:**
1. Abra Chrome/Edge e acesse `/admin`
2. Clique no **ícone de instalação** na barra de endereços
3. Ou use o botão **"Instalar App"** no sidebar do admin

---

## 🔔 **Passo 3: Ativar Notificações**

### **⚠️ Compatibilidade Importante:**

**✅ Notificações Totalmente Suportadas:**
- **Desktop Chrome/Edge** (Windows/Mac/Linux)
- **Android Chrome** (versão 42+)
- **Desktop Firefox** (versão 44+)

**🔶 Suporte Limitado:**
- **iPhone/iPad Safari**: Notificações push limitadas (iOS 16.4+)
- **Navegadores mais antigos**: Fallback para alertas

**❌ Não Suportado:**
- **iOS Safari** (versões antigas)
- **Navegadores sem HTTPS**
- **Internet Explorer**

### **Como Ativar:**

1. **Faça login** no admin
2. No **sidebar esquerdo**, clique em **"Ativar Notificações"**
3. **Permita** quando o navegador solicitar
4. Você verá uma **notificação de teste** confirmando (se suportado)

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
- **Notificações Push** nativas (quando suportadas)
- **Fallback para alertas** em navegadores limitados
- **Som e vibração** personalizados (Android/Desktop)
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
1. No admin, clique no botão **"🧪 Testar Notificação"**
2. **Se suportado**: Notificação push nativa
3. **Se não suportado**: Alert com a mensagem

### **Teste de Venda:**
1. Registre uma nova venda no sistema
2. Você deve receber notificação com:
   - Nome do cliente
   - Valor da venda em AOA

### **Teste de Relatório Diário:**
- Aguarde até às **20:00** ou
- Modifique o horário no `public/sw.js` para testar

---

## 🚨 **Resolução de Problemas Móveis**

### **❌ Erro: "can't find variable: Notification"**
**Causa**: Navegador não suporta API de Notification
**Solução**:
1. **Use Chrome no Android** (recomendado)
2. **Use Safari no iOS** (suporte limitado)
3. **Evite navegadores antigos** ou alternativos
4. **Sistema automaticamente usa fallback** (alerts)

### **❌ Notificações não chegam no iPhone:**
**Causa**: iOS tem limitações com PWA
**Soluções**:
1. **Use Safari** (não Chrome no iOS)
2. **Instale como PWA** primeiro
3. **iOS 16.4+** tem melhor suporte
4. **Sistema usa fallback** automaticamente

### **❌ PWA não instala:**
1. Certifique-se que está usando **HTTPS**
2. **Recarregue a página** completamente
3. **Limpe cache** do navegador
4. Verifique se **manifest.json** está acessível

### **❌ Service Worker não funciona:**
1. Abra **DevTools** → Application → Service Workers
2. Clique em **"Unregister"** e recarregue
3. Verifique **erros no console**
4. Confirme que está em **HTTPS**

---

## 🔧 **Configurações Avançadas**

### **Personalizar Horário do Relatório:**
No arquivo `public/sw.js`, linha ~200:
```javascript
targetTime.setHours(20, 0, 0, 0); // 20:00 (8 PM)
```

### **Personalizar Mensagens:**
No arquivo `src/lib/pwa.ts`, função `handleNewSale()`:
```typescript
title: '💰 Nova Venda Registrada!',
body: `${sale.customer_name} - ${totalFormatted}`,
```

### **Fallback Personalizado:**
Para navegadores sem suporte, o sistema usa:
1. **Service Worker** (se disponível)
2. **Alert nativo** (último recurso)

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

## 📱 **Compatibilidade Detalhada**

### **✅ Totalmente Compatível:**
- **Chrome Android** 42+
- **Chrome Desktop** 42+
- **Edge Desktop** 79+
- **Firefox Desktop** 44+

### **🔶 Parcialmente Compatível:**
- **Safari iOS** 16.4+ (notificações limitadas)
- **Safari Desktop** 16+ (funciona mas limitado)
- **Samsung Internet** 6.2+

### **❌ Não Compatível:**
- **Chrome iOS** (usa WebKit do Safari)
- **Navegadores antigos** (< 2020)
- **Internet Explorer**
- **Navegadores em HTTP** (sem HTTPS)

---

## 🎉 **Resultado Final**

Após seguir este guia, você terá:

✅ **PWA instalável** no iPhone/Android  
✅ **Notificações automáticas** (onde suportado)  
✅ **Fallback para alertas** (onde não suportado)  
✅ **Relatório diário** às 20:00  
✅ **Dashboard em tempo real**  
✅ **Funciona offline**  
✅ **Ícone personalizado** na tela inicial  
✅ **Experiência nativa** completa  

**🚀 A PWA funciona em TODOS os dispositivos com fallbacks inteligentes!**

---

## 📞 **Suporte**

Se ainda tiver problemas:
1. **Verifique o console** do navegador por erros
2. **Teste em Chrome/Safari** atualizados
3. **Confirme HTTPS** está funcionando
4. **Reporte o navegador/versão** específicos

**A PWA está configurada para funcionar mesmo em navegadores limitados! 🎯** 