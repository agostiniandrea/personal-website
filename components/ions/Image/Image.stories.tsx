import type { Meta, StoryObj } from '@storybook/react';
import Image from './index';

const meta: Meta<typeof Image> = {
  title: 'Ions/Image',
  component: Image,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    src: {
      control: 'text',
      description: 'Source URL of the image',
    },
    alt: {
      control: 'text',
      description: 'Alternative text for the image',
    },
    width: {
      control: 'number',
      description: 'Width of the image',
    },
    height: {
      control: 'number',
      description: 'Height of the image',
    },
    objectFit: {
      control: 'select',
      options: ['contain', 'cover', 'fill', 'none', 'scale-down'],
      description: 'How the image should fit within its container',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Image>;

export const Default: Story = {
  args: {
    src: 'https://picsum.photos/200/300',
    alt: 'Random image',
    width: 200,
    height: 300,
  },
};

export const Square: Story = {
  args: {
    src: 'https://picsum.photos/200/200',
    alt: 'Square image',
    width: 200,
    height: 200,
  },
};

export const Cover: Story = {
  args: {
    src: 'https://picsum.photos/200/300',
    alt: 'Cover image',
    width: 200,
    height: 300,
    objectFit: 'cover',
  },
};

export const Contain: Story = {
  args: {
    src: 'https://picsum.photos/200/300',
    alt: 'Contain image',
    width: 200,
    height: 300,
    objectFit: 'contain',
  },
};

export const WithAriaLabel: Story = {
  args: {
    src: 'https://picsum.photos/200/300',
    alt: 'Image with aria-label',
    width: 200,
    height: 300,
    'aria-label': 'Description of the image',
  },
}; 