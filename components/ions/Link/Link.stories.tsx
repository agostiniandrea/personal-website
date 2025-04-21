import type { Meta, StoryObj } from '@storybook/react';
import Link from './index';

const meta: Meta<typeof Link> = {
  title: 'Ions/Link',
  component: Link,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    href: {
      control: 'text',
      description: 'URL the link points to',
    },
    target: {
      control: 'select',
      options: ['_self', '_blank', '_parent', '_top'],
      description: 'Where to open the linked URL',
    },
    rel: {
      control: 'text',
      description: 'Relationship between the current document and the linked URL',
    },
  },
};

export default meta;
type Story = StoryObj<typeof Link>;

export const Default: Story = {
  args: {
    href: '#',
    children: 'Default Link',
  },
};

export const External: Story = {
  args: {
    href: 'https://example.com',
    target: '_blank',
    rel: 'noopener noreferrer',
    children: 'External Link',
  },
};

export const WithCustomStyles: Story = {
  args: {
    href: '#',
    children: 'Styled Link',
    style: {
      color: 'red',
      textDecoration: 'underline',
    },
  },
};

export const WithAriaLabel: Story = {
  args: {
    href: '#',
    children: 'Link with aria-label',
    'aria-label': 'Description of the link',
  },
}; 