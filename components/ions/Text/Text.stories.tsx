import type { Meta, StoryObj } from '@storybook/react';
import Text from './index';

const meta: Meta<typeof Text> = {
  title: 'Ions/Text',
  component: Text,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['small', 'regular', 'large'],
      description: 'Size variant of the text',
    },
    as: {
      control: 'select',
      options: ['p', 'span', 'div'],
      description: 'HTML element to render as',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Text>;

export const Default: Story = {
  args: {
    children: 'This is a regular text',
    variant: 'regular',
  },
};

export const Small: Story = {
  args: {
    children: 'This is a small text',
    variant: 'small',
  },
};

export const Large: Story = {
  args: {
    children: 'This is a large text',
    variant: 'large',
  },
};

export const AsSpan: Story = {
  args: {
    children: 'This text is rendered as a span',
    as: 'span',
  },
};

export const WithAriaLabel: Story = {
  args: {
    children: 'This text has an aria-label',
    'aria-label': 'Description of the text',
  },
}; 