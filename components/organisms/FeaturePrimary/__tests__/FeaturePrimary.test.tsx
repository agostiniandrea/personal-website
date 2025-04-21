import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { renderWithTheme } from '@test-utils/renderWithTheme';
import FeaturePrimary from '../index';

describe('FeaturePrimary', () => {
  it('renders feature with title', async () => {
    renderWithTheme(<FeaturePrimary />);
    
    await waitFor(() => {
      const title = screen.getByRole('heading', { name: 'Our Stories' });
      expect(title).toBeInTheDocument();
      expect(title).toHaveStyle({
        color: '#fffffe',
      });
    });
  });

  it('renders feature with description', async () => {
    renderWithTheme(<FeaturePrimary />);
    
    await waitFor(() => {
      const description = screen.getByText(/Discover our stories/);
      expect(description).toBeInTheDocument();
      expect(description).toHaveStyle({
        color: expect.stringContaining('rgb'),
      });
    });
  });

  it('renders feature with image', async () => {
    renderWithTheme(<FeaturePrimary />);
    
    await waitFor(() => {
      const image = screen.getByAltText('Collection of our stories');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('role', 'img');
      expect(image).toHaveAttribute('aria-labelledby', expect.stringContaining('img-'));
      
      const figcaption = screen.getByText('A visual gallery representing the various stories and experiences we share in the blog');
      expect(figcaption).toBeInTheDocument();
    });
  });
}); 