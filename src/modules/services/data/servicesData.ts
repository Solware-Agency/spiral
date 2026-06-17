import { socialMediaPackageTiers } from './socialMediaPackages';
import { contentDaysPackageCards } from './contentDaysPackages';
import { graphicDesignCategories } from './graphicDesignPackages';

export const servicesData = [
  {
    id: '01',
    title: 'SOCIAL MEDIA\nMANAGEMENT',
    description:
      'Social media management is a part time role to do work. It includes: creative direction & content creation, managing your feed, writing captions, scheduling, community engagement, and monthly reporting with planning and content strategy.',
    imageUrl: '/images/photos/DSC01963.jpg',
    packageTiers: socialMediaPackageTiers,
  },
  {
    id: '02',
    title: 'ALL ACCESS\nCONTENT DAYS',
    description:
      'Ideal for month-by-month clients who need high-impact content in a short time. We plan the shot list, style and direction, capture photos + video, and deliver an organized library for consistent posting across your channels.',
    imageUrl: '/images/photos/DSC02040.jpg',
    packageCards: contentDaysPackageCards,
  },
  {
    id: '03',
    title: 'Graphic Design',
    description:
      'Graphic design services include brand assets, social templates, campaign visuals, and polished layouts that keep your brand cohesive and elevated across every touchpoint.',
    imageUrl: '/images/photos/DSC02380.jpg',
    packageCategories: graphicDesignCategories,
  },
];

