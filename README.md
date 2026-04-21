# KING — Oversized Sagrado

E-commerce premium de streetwear oversized com identidade católica/real.
Construído com React + TypeScript + Vite + TailwindCSS + Firebase.

> _"Vista-se com o rei."_

## Stack

- **React 18** + **TypeScript** + **Vite**
- **TailwindCSS** (dark mode por classe)
- **Framer Motion** — animações de UI
- **GSAP + ScrollTrigger** — storytelling por scroll
- **Lenis** — smooth scroll premium
- **React Three Fiber** (+ drei) — coroa 3D do hero
- **Zustand** — estado global (auth, carrinho, produtos, tema)
- **Firebase** — Auth (e-mail + Google), Firestore, Storage
- **react-hot-toast** — feedback do usuário
- **react-icons** — ícones

## Rodar o projeto

```bash
npm install
npm run dev
```

Abre em `http://localhost:5173`.

Para build de produção:

```bash
npm run build
npm run preview
```

## Estrutura

```
src/
  components/
    auth/           ProtectedRoute, AdminRoute
    cart/           CartDrawer
    home/           Hero, BrandStory, Featured, Sacred, Parallax, Newsletter
    layout/         Navbar, Footer, ScrollToTop, SmoothScroll
    products/       ProductCard
    three/          Crown3D (React Three Fiber)
    ui/             CustomCursor, LoadingScreen, PageTransition, GlowButton, SectionHeading
  data/             seedProducts (fallback quando Firestore está vazio)
  pages/            Home, Products, ProductDetail, Cart, Checkout,
                    Login, Register, Dashboard, Admin, NotFound
  services/         firebase, auth.service, products.service, orders.service
  store/            useAuthStore, useCartStore, useProductsStore, useThemeStore
  utils/            cn, format, whatsapp
  App.tsx · main.tsx · index.css
```

## Firebase

O app já está configurado com o projeto **kingoversized-33086**.
Ative no console:

1. **Authentication** → Método: E-mail/Senha + Google (já feito).
2. **Firestore** → coleções `products`, `orders`, `users`.
3. **Storage** (opcional, para upload futuro).
4. **Regras** (cole em Firestore Rules):

```
Veja o arquivo firestore.rules incluído.
```

### Acesso Admin

O painel em `/admin` só é acessível para o e-mail
**`kingoversized@gmail.com`**. Qualquer outro usuário autenticado é
redirecionado para a home com notificação.

## WhatsApp

Contato configurado para o número **79 99906-2401** (já no código, em
`src/utils/whatsapp.ts`). Cada pedido gera uma mensagem pré-formatada.

## Paleta

| Cor       | Hex       | Uso                       |
| --------- | --------- | ------------------------- |
| Preto     | `#050505` | Fundo dominante           |
| Jet       | `#0a0a0a` | Cards, drawer, surfaces   |
| Vermelho  | `#dc143c` | Acento, CTAs, brilho      |
| Carmesim  | `#ff1f3d` | Glow intenso              |
| Dourado   | `#d4af37` | Detalhes sagrados (coroa) |
| Osso      | `#faf7f0` | Texto principal           |

## Tipografia

- **Cinzel** — títulos, logomarca (headings serifados, regais)
- **Cormorant Garamond** — textos em itálico, manifesto
- **Inter** — UI
- **JetBrains Mono** — overlines, metadados

## Experiência

- Cursor customizado com glow (desativado em touch)
- Smooth scroll via Lenis (ScrollTrigger ligado)
- Transições de página com Framer Motion
- Microinterações em todos os CTAs
- Dark/light toggle persistido em localStorage
- Loading screen com revelação tipográfica

## Rotas

| Rota              | Descrição                                    |
| ----------------- | -------------------------------------------- |
| `/`               | Home com hero 3D + storytelling              |
| `/produtos`       | Grid com filtros por categoria e tamanho    |
| `/produtos/:id`   | Detalhe com galeria animada                  |
| `/carrinho`       | Sacola completa                              |
| `/checkout`       | Checkout premium (protegido)                 |
| `/login`          | Login Firebase (e-mail + Google)             |
| `/cadastro`       | Cadastro                                     |
| `/dashboard`      | Pedidos do usuário + WhatsApp (protegido)    |
| `/admin`          | Painel admin (apenas kingoversized@gmail)    |

## Próximos passos sugeridos

- Upload real de imagens via Firebase Storage no admin
- Integração com Stripe/Mercado Pago
- Sistema de cupons/descontos
- Avaliações dos produtos
- E-mail transacional (Firebase Functions)

---

_Ad Majorem Dei Gloriam · 2026_
