export type GraphicDesignCategory = {
  id: string;
  name: string;
  variant: 'gray' | 'white';
};

export const graphicDesignCategories: GraphicDesignCategory[] = [
  { id: 'branding', name: 'BRANDING', variant: 'white' },
  { id: 'marketing-collateral', name: 'MARKETING COLLATERAL', variant: 'gray' },
  { id: 'social-graphics', name: 'SOCIAL GRAPHICS', variant: 'white' },
];
