# Sistema de SEO Automático - Manual de Uso

## 🔧 Configuração Atual

O sistema de SEO automático foi configurado para **não poluir o console** por padrão. Os logs estão desabilitados para melhorar a experiência de desenvolvimento.

## 🚀 Como Usar

### No Console do Navegador

1. **Habilitar logs do sistema:**
   ```javascript
   enableSEOLogs()
   ```

2. **Inicializar o sistema (se não estiver rodando):**
   ```javascript
   initializeAutoSEO()
   ```

3. **Desabilitar logs:**
   ```javascript
   disableSEOLogs()
   ```

## 📊 Funcionalidades

### Monitoramento Automático
- Verifica novos produtos a cada **30 minutos**
- Gera SEO automaticamente para produtos e categorias
- Otimiza palavras-chave para Angola

### Relatórios
- Produtos ativos
- Categorias
- Produtos recentes (últimos 7 dias)
- Produtos com alta otimização SEO

### Palavras-chave Otimizadas
- Específicas para Angola (Luanda, Benguela, etc.)
- Termos locais de busca
- Contexto de importação

## 🔄 Configurações

### Intervalo de Verificação
- **Padrão**: 30 minutos
- **Anterior**: 5 minutos (muito frequente)

### Logs
- **Padrão**: Desabilitados
- **Desenvolvimento**: Habilitáveis via console

## 🛠️ Para Desenvolvedores

### Modificar Intervalo
```javascript
// No arquivo autoSEOUpdater.ts
private updateInterval: number = 30 * 60 * 1000; // 30 minutos
```

### Forçar Atualização Completa
```javascript
// No console
autoSEOUpdater.forceFullUpdate()
```

### Gerar Relatório
```javascript
// No console
autoSEOUpdater.generateSEOReport()
```

## 📝 Exemplo de Uso

```javascript
// 1. Habilitar logs
enableSEOLogs()

// 2. Inicializar sistema
initializeAutoSEO()

// 3. Acompanhar logs no console
// O sistema mostrará:
// - Produtos detectados
// - SEO atualizado
// - Palavras-chave geradas
// - Relatórios

// 4. Desabilitar logs quando necessário
disableSEOLogs()
```

## 🎯 Benefícios

- **Performance**: Não polui o console em desenvolvimento
- **Controle**: Logs habilitáveis quando necessário
- **Flexibilidade**: Sistema pode ser iniciado/parado manualmente
- **Otimização**: Intervalo ajustado para uso real

## 🚨 Importante

- O sistema está **desabilitado por padrão** para evitar logs constantes
- Para usar em produção, descomente a linha no `main.tsx`
- Os logs podem ser habilitados/desabilitados a qualquer momento 