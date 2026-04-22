import type { Product } from '@/services/products.service';

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'seed-1',
    name: 'Oversized Sacred Heart',
    description:
      'Camiseta oversized em algodão premium 240g/m². Estampa do Sagrado Coração em serigrafia de alta durabilidade. Acabamento preto absoluto com gola reforçada.',
    price: 189.9,
    oldPrice: 249.9,
    images: [
      'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=1200&q=80',
      'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=1200&q=80',
      'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=1200&q=80',
    ],
    category: 'oversized',
    sizes: ['P', 'M', 'G', 'GG', 'XGG'],
    stock: 42,
    featured: true,
    tag: 'Novo',
  },
  {
    id: 'seed-2',
    name: 'Crown of Kings',
    description:
      'Oversized linha sagrada. Estampa coroa em foil dourado. Tecido encorpado, caimento amplo e manga alongada.',
    price: 219.9,
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1200&q=80',
      'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=1200&q=80',
    ],
    category: 'oversized',
    sizes: ['M', 'G', 'GG', 'XGG'],
    stock: 18,
    featured: true,
    tag: 'Limited',
  },
  {
    id: 'seed-3',
    name: 'Via Crucis Tee',
    description:
      'Camiseta oversized com arte da Via Crucis nas costas. Collab da linha sagrada. Tiragem limitada e numerada.',
    price: 249.9,
    images: [
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=1200&q=80',
      'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=1200&q=80',
    ],
    category: 'colecao-sacra',
    sizes: ['P', 'M', 'G', 'GG'],
    stock: 10,
    featured: true,
    tag: 'Sacred',
  },
  {
    id: 'seed-4',
    name: 'Moletom Divino',
    description:
      'Moletom oversized flanelado, capuz duplo e bolso canguru. Bordado KING no peito em linha dourada.',
    price: 329.9,
    images: [
      'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=1200&q=80',
      'https://images.unsplash.com/photo-1620799140188-3b2a02fd9a77?w=1200&q=80',
    ],
    category: 'moletom',
    sizes: ['M', 'G', 'GG', 'XGG'],
    stock: 25,
    featured: true,
    tag: 'Winter',
  },
  {
    id: 'seed-5',
    name: 'Regata Filho do Rei',
    description:
      'Regata oversized em malha pesada. Cava reforçada e estampa coroa frontal.',
    price: 139.9,
    images: [
      'https://images.unsplash.com/photo-1618354691438-25bc04584c23?w=1200&q=80',
    ],
    category: 'regata',
    sizes: ['P', 'M', 'G', 'GG'],
    stock: 30,
    tag: 'Summer',
  },
  {
    id: 'seed-6',
    name: 'Cross of Faith',
    description:
      'Camiseta oversized com estampa da cruz em grande escala nas costas. Linha streetwear sagrada.',
    price: 199.9,
    images: [
      'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=1200&q=80',
      'https://images.unsplash.com/photo-1622445275463-afa2ab738c34?w=1200&q=80',
    ],
    category: 'camiseta',
    sizes: ['P', 'M', 'G', 'GG', 'XGG'],
    stock: 50,
  },
  {
    id: 'seed-7',
    name: 'Royal Black Oversized',
    description:
      'Peça coringa em preto absoluto. Corte oversized, caimento impecável, acabamento premium.',
    price: 169.9,
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=1200&q=80',
    ],
    category: 'oversized',
    sizes: ['P', 'M', 'G', 'GG', 'XGG'],
    stock: 60,
    featured: true,
  },
  {
    id: 'seed-8',
    name: 'Angel Wings Tee',
    description:
      'Camiseta oversized com estampa de asas angelicais dorsal. Edição devocional.',
    price: 229.9,
    images: [
      'https://images.unsplash.com/photo-1620012253295-c15cc3e65df4?w=1200&q=80',
    ],
    category: 'colecao-sacra',
    sizes: ['M', 'G', 'GG'],
    stock: 15,
    tag: 'Sacred',
  },
];
