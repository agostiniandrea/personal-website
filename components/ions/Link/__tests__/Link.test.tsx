import React from 'react';
import { render, screen } from '@testing-library/react';
import { renderWithTheme } from '@test-utils/renderWithTheme';
import Link from '../index';

describe('Link', () => {
  it('renders with default styles', () => {
    renderWithTheme(<Link href="https://example.com">Test Link</Link>);
    
    const link = screen.getByRole('link', { name: 'Test Link' });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute('href', 'https://example.com');
    expect(link).toHaveStyle({
      color: 'rgb(238, 187, 195)',
      textDecoration: 'none',
    });
  });

  it('renders with custom styles', () => {
    const customStyles = {
      color: 'rgb(255, 0, 0)',
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

  it('renders children', () => {
    renderWithTheme(
      <Link href="https://example.com">
        <span>Nested Content</span>
      </Link>
    );
    
    expect(screen.getByText('Nested Content')).toBeInTheDocument();
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      renderWithTheme(
        <Link href="https://example.com" ariaLabel="Test Link">
          Test Link
        </Link>
      );

      const link = screen.getByRole('link', { name: 'Test Link' });
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://example.com');
      expect(link).toHaveAttribute('aria-label', 'Test Link');
    });

    it('should indicate external links', () => {
      renderWithTheme(
        <Link href="https://example.com" isExternal>
          External Link
        </Link>
      );

      const link = screen.getByRole('link', { name: 'External Link' });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });
}); 