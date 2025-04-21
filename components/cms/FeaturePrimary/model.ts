import { FeaturePrimaryProps } from './index';

export const defaultFeature: FeaturePrimaryProps = {
  preHeading: 'Featured Article',
  heading: 'The Future of Web Development',
  description: 'Discover the latest trends and technologies shaping the future of web development.',
  image: {
    url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643',
    alt: 'Web Development',
    height: 800,
    width: 1200,
    type: 'image/jpeg',
  },
  cta: {
    label: 'Read More',
    name: 'Read More',
    url: '/articles/web-development-future',
  },
};

export const minimalFeature: FeaturePrimaryProps = {
  preHeading: null,
  heading: 'Simple Feature',
  description: null,
  image: {
    url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643',
    alt: 'Simple Feature',
    height: 800,
    width: 1200,
    type: 'image/jpeg',
  },
};

export const longContentFeature: FeaturePrimaryProps = {
  preHeading: 'In-Depth Analysis',
  heading: 'Understanding the Complexities of Modern Web Architecture',
  description: 'A comprehensive guide exploring the intricate details of modern web architecture, from microservices to serverless computing, and how they impact development workflows and business outcomes.',
  image: {
    url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643',
    alt: 'Web Architecture',
    height: 800,
    width: 1200,
    type: 'image/jpeg',
  },
  cta: {
    label: 'Explore Architecture',
    name: 'Explore Architecture',
    url: '/articles/web-architecture',
  },
};

export const specialCharactersFeature: FeaturePrimaryProps = {
  preHeading: 'Special Edition',
  heading: 'Café & More: Digital Transformation',
  description: 'How local businesses are embracing digital transformation to enhance customer experiences and streamline operations.',
  image: {
    url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643',
    alt: 'Digital Transformation',
    height: 800,
    width: 1200,
    type: 'image/jpeg',
  },
  cta: {
    label: 'Learn More',
    name: 'Learn More',
    url: '/articles/digital-transformation',
  },
}; 