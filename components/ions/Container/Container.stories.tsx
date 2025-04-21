import type { Meta, StoryObj } from '@storybook/react';
import Container from './index';

const meta: Meta<typeof Container> = {
  title: 'Ions/Container',
  component: Container,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    verticalPadding: {
      control: 'boolean',
      description: 'Adds vertical padding to the container',
    },
    maxWidth: {
      control: 'text',
      description: 'Maximum width of the container',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Container>;

export const Default: Story = {
  args: {
    children: 'Default container content',
  },
};

export const WithVerticalPadding: Story = {
  args: {
    children: 'Container with vertical padding',
    verticalPadding: true,
  },
};

export const WithCustomMaxWidth: Story = {
  args: {
    children: 'Container with custom max width',
    maxWidth: '800px',
  },
};

export const WithBoth: Story = {
  args: {
    children: 'Container with both vertical padding and custom max width',
    verticalPadding: true,
    maxWidth: '800px',
  },
}; 