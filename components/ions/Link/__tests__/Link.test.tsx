import React from 'react';
import { render, screen } from '@testing-library/react';
import { renderWithTheme } from '@test-utils/renderWithTheme';
import Link from '../index';

describe('Link', () => {
  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      renderWithTheme(
        <Link href="https://example.com">
          Test Link
        </Link>
      );

      const link = screen.getByRole('link', { name: 'Test Link' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://example.com');
      expect(link).toHaveAttribute('aria-label', 'Test Link');
    });

    it('should have proper color contrast', () => {
      renderWithTheme(
        <Link href="https://example.com">
          Test Link
        </Link>
      );

      const link = screen.getByRole('link', { name: 'Test Link' });
      expect(link).toHaveStyle({
        color: expect.stringContaining('rgb'),
      });
    });

    it('should indicate external links', () => {
      renderWithTheme(
        <Link href="https://example.com" isExternal>
          External Link
        </Link>
      );

      const link = screen.getByRole('link', { name: 'External Link (opens in new tab)' });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
      expect(link).toHaveAttribute('aria-label', 'External Link (opens in new tab)');
      expect(link).toHaveAttribute('tabIndex', '0');
    });
  });

  describe('Functionality', () => {
    it('should render with default styles', () => {
      renderWithTheme(
        <Link href="https://example.com">
          Test Link
        </Link>
      );

      const link = screen.getByRole('link', { name: 'Test Link' });
      expect(link).toHaveStyle({
        color: expect.stringContaining('rgb'),
        textDecoration: 'none',
        fontSize: expect.stringContaining('px'),
      });
    });

    it('should apply custom styles', () => {
      const customStyles = {
        color: 'red',
        fontSize: '20px',
      };

      renderWithTheme(
        <Link href="https://example.com" styles={customStyles}>
          Test Link
        </Link>
      );

      const link = screen.getByRole('link', { name: 'Test Link' });
      expect(link).toHaveStyle(customStyles);
    });

    it('should render children', () => {
      renderWithTheme(
        <Link href="https://example.com">
          <span>Nested Content</span>
        </Link>
      );

      expect(screen.getByText('Nested Content')).toBeInTheDocument();
    });

    it('should use custom aria-label when provided', () => {
      renderWithTheme(
        <Link href="https://example.com" ariaLabel="Custom Label">
          Link Text
        </Link>
      );

      const link = screen.getByRole('link', { name: 'Custom Label' });
      expect(link).toBeInTheDocument();
    });
  });
}); 