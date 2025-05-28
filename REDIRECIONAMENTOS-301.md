# Configuração de Redirecionamentos 301 - DOT ANGOLA

## ✅ Redirecionamentos Configurados

Os redirecionamentos 301 foram configurados automaticamente baseado na análise do site atual **dotangola.com** e o novo projeto.

### 📊 Mapeamento Realizado:

| URL Antiga (dotangola.com) | URL Nova (novo site) | Motivo |
|----------------------------|---------------------|---------|
| `/collections/gift-cards` | `/` | Gift cards são o foco principal |
| `/collections/videogame` | `/` | Jogos/videogames relacionados a gift cards |
| `/collections/softwares` | `/` | Softwares digitais via gift cards |
| `/collections/subscricoes` | `/` | Subscrições via gift cards |
| `/collections/jogos` | `/` | Jogos digitais via gift cards |
| `/collections/telefones` | `/importacao` | Produtos físicos → serviço de importação |
| `/collections/computadores` | `/importacao` | Produtos físicos → serviço de importação |
| `/collections/acessorios` | `/importacao` | Produtos físicos → serviço de importação |
| `/collections/drones` | `/importacao` | Produtos físicos → serviço de importação |
| `/collections/trotinetes` | `/importacao` | Produtos físicos → serviço de importação |
| `/collections/imagem-e-video` | `/importacao` | Produtos físicos → serviço de importação |
| `/collections/audio-e-som` | `/importacao` | Produtos físicos → serviço de importação |
| `/collections/smart` | `/importacao` | Produtos físicos → serviço de importação |
| `/collections/redes` | `/importacao` | Produtos físicos → serviço de importação |
| `/pages/sobre-nos` | `/sobre-nos` | Página institucional mantida |
| `/pages/contato` | `/contato` | Página de contato mantida |
| `/pages/termos` | `/termos` | Termos e condições mantidos |
| `/pages/privacidade` | `/privacidade` | Política de privacidade mantida |
| `/cart` | `/` | Carrinho → página principal |
| `/account` | `/` | Conta → página principal |
| `/search` | `/` | Busca → página principal |

### 🔥 Produtos Mais Vendidos - Redirecionamentos Específicos:

| URL Antiga (dotangola.com) | URL Nova (novo site) | Produto |
|----------------------------|---------------------|---------|
| `/products/tv-express` | `/` | TV Express |
| `/products/tvexpress` | `/` | TV Express (variação) |
| `/products/my-family-cinema` | `/` | My Family Cinema |
| `/products/netflix` | `/` | Netflix |
| `/products/diamantes-free-fire` | `/` | Diamantes Free Fire |
| `/products/free-fire` | `/` | Free Fire (variação) |
| `/products/prime-video` | `/` | Prime Video |
| `/products/amazon-prime` | `/` | Amazon Prime (variação) |

### 🔍 Buscas dos Produtos Mais Vendidos:

| URL de Busca Antiga | URL Nova | Termo Buscado |
|---------------------|----------|---------------|
| `/search?q=tv+express` | `/` | TV Express |
| `/search?q=netflix` | `/` | Netflix |
| `/search?q=free+fire` | `/` | Free Fire |
| `/search?q=prime+video` | `/` | Prime Video |
| `/search?q=my+family+cinema` | `/` | My Family Cinema |

## 🎯 Estratégia de Redirecionamento

### **Gift Cards e Digitais → Página Principal (`/`)**
- Produtos que se alinham com o novo foco do site
- Mantém relevância para SEO de gift cards
- Preserva tráfego de produtos digitais
- **Inclui os produtos mais vendidos**: TV Express, Netflix, Free Fire, Prime Video, My Family Cinema

### **Produtos Físicos → Importação (`/importacao`)**
- Redireciona hardware e eletrônicos para o serviço de importação
- Mantém a proposta de valor para clientes interessados em produtos físicos
- Oferece alternativa relevante

### **Páginas Institucionais → Páginas Correspondentes**
- Mantém estrutura de SEO para páginas importantes
- Preserva autoridade de páginas como "Sobre Nós" e "Contato"

## 🔧 Como Funciona

O arquivo `vercel.json` está configurado com todos os redirecionamentos 301. Quando alguém acessar:

```
https://dotangola.com/products/netflix
```

Será automaticamente redirecionado para:

```
https://novo-dominio.com/
```

## 📈 Benefícios para SEO

1. **Preserva Link Juice**: Transfere autoridade das páginas antigas
2. **Evita 404**: Nenhuma página retornará erro
3. **Mantém Rankings**: Google entende que é uma migração
4. **Experiência do Usuário**: Visitantes encontram conteúdo relevante
5. **Produtos Populares**: Redirecionamentos específicos para os mais vendidos

## ⚠️ Próximos Passos

1. **Deploy do novo site** com as configurações
2. **Teste todos os redirecionamentos** (use httpstatus.io)
3. **Monitore Google Search Console** por 30 dias
4. **Submeta novo sitemap** no Google Search Console
5. **Mantenha site antigo** por 30 dias como backup

## 🛠️ Verificação Pós-Deploy

Teste estes redirecionamentos após o deploy:

```bash
# Teste produtos mais vendidos - deve retornar status 301
curl -I https://seu-novo-dominio.com/products/netflix
curl -I https://seu-novo-dominio.com/products/tv-express
curl -I https://seu-novo-dominio.com/products/free-fire
curl -I https://seu-novo-dominio.com/products/prime-video
curl -I https://seu-novo-dominio.com/products/my-family-cinema

# Teste categorias
curl -I https://seu-novo-dominio.com/collections/telefones
curl -I https://seu-novo-dominio.com/collections/gift-cards
curl -I https://seu-novo-dominio.com/pages/sobre-nos
```

## 📞 Suporte

Se precisar ajustar algum redirecionamento, edite o arquivo `vercel.json` e faça novo deploy.

---

**✅ Status**: Redirecionamentos configurados e prontos para deploy!
**🔥 Produtos mais vendidos**: TV Express, Netflix, Free Fire, Prime Video, My Family Cinema - todos redirecionados! 