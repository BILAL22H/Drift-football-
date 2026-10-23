import { PackDefinition } from '../types';

export const CARD_PACKS: PackDefinition[] = [
  {
    id: 'silver-pack',
    nameEn: 'Silver Stars Pack',
    nameAr: 'حزمة النجوم الفضية',
    cost: 150,
    cardCount: 2,
    minRating: 80,
    descriptionEn: 'Contains 2 cards with a minimum 80 OVR player.',
    descriptionAr: 'تحتوي على بطاقتين مع لاعب بتقييم 80 كحد أدنى.',
    badge: '🥈',
    colorScheme: 'silver'
  },
  {
    id: 'gold-pack',
    nameEn: 'Gold Jumbo Pack',
    nameAr: 'حزمة الذهب الكبرى',
    cost: 350,
    cardCount: 3,
    minRating: 85,
    descriptionEn: 'Contains 3 premium players with a guaranteed 85+ OVR superstar!',
    descriptionAr: 'تحتوي على 3 لاعبين متميزين مع نجم مضمون بتقييم +85!',
    badge: '🏆',
    colorScheme: 'gold'
  },
  {
    id: 'champions-pack',
    nameEn: 'Champions Elite Pack',
    nameAr: 'حزمة أبطال النخبة',
    cost: 650,
    cardCount: 4,
    minRating: 88,
    descriptionEn: 'Ultra rare pack containing 4 cards with guaranteed 88+ Legendary/TOTW players!',
    descriptionAr: 'حزمة نادرة للغاية تحتوي على 4 بطاقات مع لاعبين أساطير بتقييم +88!',
    badge: '⚡',
    colorScheme: 'champions'
  }
];
