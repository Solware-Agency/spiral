export type PackageTier = {
  id: string;
  name: string;
  description: string;
  features: string[];
};

export const socialMediaPackageTiers: PackageTier[] = [
  {
    id: 'essential',
    name: 'ESSENTIAL',
    description:
      'Great for businesses ready to launch their social presence. Get essential social media management to establish your brand and connect with your audience.',
    features: [
      '1 Content Day (3Hrs)',
      '3 Feed posts p/week',
      '6 Story posts p/week',
      'Feed design/management',
      'Monthly Strategy Call',
    ],
  },
  {
    id: 'premium',
    name: 'PREMIUM',
    description:
      'For brands built to stand out. This package pairs strategic expertise with exceptional content to fuel growth and establish market leadership.',
    features: [
      '2 Content Days - Camera + iPhone',
      '4 Feed posts p/week',
      '10 Story posts p/week',
      'Feed design/management',
      'Monthly Strategy Call',
      'Community Engagement',
      'Graphic Design for socials',
    ],
  },
  {
    id: 'elite',
    name: 'ELITE',
    description:
      'Perfect for ambitious businesses ready to transform their marketing. This package focuses on reaching your ideal audience, building genuine community, and driving sustainable growth through strategic, high-quality content.',
    features: [
      '2 Content Days - Camera + iPhone',
      '5-6 Feed posts p/week',
      '15 Story posts p/week',
      'Feed design/management',
      'Monthly Strategy Call',
      'Community Engagement',
      'Graphic Design for socials',
      'Quarterly campaigns',
    ],
  },
];
