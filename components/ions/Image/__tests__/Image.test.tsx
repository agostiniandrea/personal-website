import React from 'react';
import { screen } from '@testing-library/react';
import Image from '../index';
import { renderWithTheme } from '@test-utils/renderWithTheme';

describe('Image', () => {
  it('renders image with default props', () => {
    renderWithTheme(
      <Image src="/test-image.jpg" alt="Test Image" />
    );
    
    const image = screen.getByRole('img', { name: 'Test Image' });
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/test-image.jpg');
    expect(image).toHaveAttribute('alt', 'Test Image');
  });

  it('renders image with custom styles', () => {
    renderWithTheme(
      <Image 
        src="/test-image.jpg" 
        alt="Test Image" 
        style={{ width: '100px', height: '100px' }} 
      />
    );
    
    const image = screen.getByRole('img', { name: 'Test Image' });
    expect(image).toHaveStyle({
      width: '100px',
      height: '100px',
    });
  });

  it('renders image with custom className', () => {
    renderWithTheme(
      <Image 
        src="/test-image.jpg" 
        alt="Test Image" 
        className="custom-class" 
      />
    );
    
    const image = screen.getByRole('img', { name: 'Test Image' });
    expect(image).toHaveClass('custom-class');
  });
}); 