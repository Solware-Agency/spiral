export type ContentDaysPackageCard = {
  id: string;
  name: string;
  variant: 'gray' | 'white';
  features: string[];
};

export const contentDaysPackageCards: ContentDaysPackageCard[] = [
  {
    id: 'half',
    name: 'HALF',
    variant: 'gray',
    features: [
      'Creative meeting',
      'Shot List + Mood Board',
      '4 Hours of Shooting',
      'Min 20 photos',
      'Min 30 b-roll/BTS videos',
      'Min 5-10 9:16 Edited Videos',
    ],
  },
  {
    id: 'full',
    name: 'FULL',
    variant: 'white',
    features: [
      'Creative meeting',
      'Shot List + Mood Board',
      '6 Hours of Shooting',
      'Min 45 photos',
      'Min 50 b-roll/BTS videos',
      'Min 10-15 9:16 Edited Videos',
    ],
  },
];
