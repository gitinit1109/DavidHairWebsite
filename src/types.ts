export interface MensWigProduct {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  baseMaterial: string;
  baseMaterialLabel: string;
  priceType: 'custom' | 'ready';
  tag: string;
  imgUrl: string;
  description: string;
  breathability: number; // 1 to 5
  durability: number; // 1 to 5
  naturalness: number; // 1 to 5
  features: string[];
  stylingTips: string;
  bestFit: string;
  lifeSpan: string;
}

export interface WomensWigProduct {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  baseMaterial: string;
  baseMaterialLabel: string;
  priceType: 'custom' | 'ready';
  tag: string;
  description: string;
  breathability: number; // 1 to 5
  durability: number; // 1 to 5
  naturalness: number; // 1 to 5
  features: string[];
  stylingTips: string;
  bestFit: string;
  lifeSpan: string;
}

export interface ChemoWigProduct {
  id: string;
  title: string;
  category: string;
  categoryLabel: string;
  baseMaterial: string;
  baseMaterialLabel: string;
  priceType: 'custom' | 'ready';
  tag: string;
  description: string;
  breathability: number; // 1 to 5
  durability: number; // 1 to 5
  naturalness: number; // 1 to 5
  gentleness: number; // 1 to 5
  features: string[];
  stylingTips: string;
  bestFit: string;
  lifeSpan: string;
}

export interface EstimatorResult {
  weight: number; // in grams
  breathabilityScore: number; // percentage
  suitedGlues: string[];
  cleaningInterval: string;
  densityFactor: string;
}
