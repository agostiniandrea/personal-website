import type { Meta, StoryObj } from '@storybook/react';
import HeroPrimary from './index';

const meta: Meta<typeof HeroPrimary> = {
  title: 'CMS/HeroPrimary',
  component: HeroPrimary,
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof HeroPrimary>;

export const Default: Story = {
  args: {
    heading: 'Welcome to Our Blog',
    description: 'Discover amazing stories and insights from our team',
    image: {
      url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643',
      alt: 'Hero image',
      height: 800,
      width: 1200,
      type: 'image/jpeg',
    },
  },
};

export const LongContent: Story = {
  args: {
    heading: 'The Future of Web Development: Trends and Predictions for 2024',
    description: 'In this comprehensive guide, we explore the latest trends in web development, from AI integration to new frameworks and tools that are shaping the future of the industry.',
    image: {
      url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643',
      alt: 'Hero image',
      height: 800,
      width: 1200,
      type: 'image/jpeg',
    },
  },
};

export const MobileView: Story = {
  args: {
    heading: 'Welcome to Our Blog',
    description: 'Discover amazing stories and insights from our team',
    image: {
      url: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643',
      alt: 'Hero image',
      height: 800,
      width: 1200,
      type: 'image/jpeg',
    },
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
  },
}; 