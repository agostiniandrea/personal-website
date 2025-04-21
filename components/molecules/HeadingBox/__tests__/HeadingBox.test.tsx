import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWithTheme } from '@test-utils/renderWithTheme';
import { mockMobileViewport, mockDesktopViewport } from '@test-utils/mockMatchMedia';
import HeadingBox from '../index';
import { defaultHeadingBox, aboutHeadingBox, minimalHeadingBox, withLongContent, withSpecialCharacters } from '../model';
import { act } from 'react';

describe('HeadingBox', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    mockDesktopViewport();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders default heading box correctly', async () => {
    renderWithTheme(<HeadingBox {...defaultHeadingBox} />);
    
    await waitFor(() => {
      expect(screen.getByText('Welcome to')).toBeInTheDocument();
      expect(screen.getByText('Our Amazing Blog')).toBeInTheDocument();
      expect(screen.getByText('Discover interesting articles and stories from our team.')).toBeInTheDocument();
      expect(screen.getByText('Start Reading')).toBeInTheDocument();
    });
  });

  it('renders about heading box without CTA', async () => {
    renderWithTheme(<HeadingBox {...aboutHeadingBox} />);
    
    await waitFor(() => {
      expect(screen.getByText('About')).toBeInTheDocument();
      expect(screen.getByText('Our Mission')).toBeInTheDocument();
      expect(screen.getByText('We strive to deliver the best content for our readers.')).toBeInTheDocument();
      expect(screen.queryByText('Start Reading')).not.toBeInTheDocument();
    });
  });

  it('renders minimal heading box with only heading', async () => {
    renderWithTheme(<HeadingBox {...minimalHeadingBox} />);
    
    await waitFor(() => {
      expect(screen.queryByText('Welcome to')).not.toBeInTheDocument();
      expect(screen.getByText('Simple Heading')).toBeInTheDocument();
      expect(screen.queryByText('Discover interesting articles')).not.toBeInTheDocument();
    });
  });

  it('renders heading box with long content', async () => {
    renderWithTheme(<HeadingBox {...withLongContent} />);
    
    await waitFor(() => {
      expect(screen.getByText('Featured Article')).toBeInTheDocument();
      expect(screen.getByText('The Future of Web Development: Trends and Predictions for 2024')).toBeInTheDocument();
      expect(screen.getByText(/In this comprehensive guide/)).toBeInTheDocument();
      expect(screen.getByText('Read More')).toBeInTheDocument();
    });
  });

  it('renders heading box with special characters', async () => {
    renderWithTheme(<HeadingBox {...withSpecialCharacters} />);
    
    await waitFor(() => {
      expect(screen.getByText('Special Edition')).toBeInTheDocument();
      expect(screen.getByText('Café & More: A Guide to Local Eateries')).toBeInTheDocument();
      expect(screen.getByText(/Discover the best places to eat/)).toBeInTheDocument();
      expect(screen.getByText('View Guide')).toBeInTheDocument();
    });
  });

  it('hides description on mobile view', async () => {
    mockMobileViewport();
    renderWithTheme(<HeadingBox {...defaultHeadingBox} />);
    
    await waitFor(() => {
      const description = screen.getByText(defaultHeadingBox.description!);
      expect(description).toHaveStyle({ opacity: '0' });
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', async () => {
      renderWithTheme(
        <HeadingBox
          heading={defaultHeadingBox.heading}
          description={defaultHeadingBox.description}
          preHeading={defaultHeadingBox.preHeading}
          cta={defaultHeadingBox.cta}
        />
      );

      await waitFor(() => {
        // Check if the section has proper role and ARIA attributes
        const section = screen.getByRole('region');
        expect(section).toBeInTheDocument();
        expect(section).toHaveAttribute('aria-label', 'Heading Box');

        // Check if the pre-heading is present
        const preHeading = screen.getByText(defaultHeadingBox.preHeading!);
        expect(preHeading).toBeInTheDocument();
        expect(preHeading).toHaveAttribute('id', 'pre-heading');

        // Check if the heading has proper ARIA attributes
        const heading = screen.getByRole('heading', { level: 2 });
        expect(heading).toBeInTheDocument();
        expect(heading).toHaveAttribute('id', 'heading-title');

        // Check if the description has proper ARIA attributes
        const description = screen.getByText(defaultHeadingBox.description!);
        expect(description).toBeInTheDocument();
        expect(description).toHaveAttribute('id', 'heading-description');

        // Check if the CTA button has proper ARIA attributes
        const button = screen.getByRole('link', { name: defaultHeadingBox.cta!.label });
        expect(button).toBeInTheDocument();
        expect(button).toHaveAttribute('aria-label', defaultHeadingBox.cta!.label);
      });
    });

    it('should be keyboard navigable', async () => {
      renderWithTheme(<HeadingBox {...defaultHeadingBox} />);
      
      const button = await waitFor(() => screen.getByRole('link', { name: defaultHeadingBox.cta!.label }));
      
      await act(async () => {
        fireEvent.keyDown(button, { key: 'Enter', code: 'Enter' });
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(button).toHaveAttribute('tabIndex', '0');
      });
      
      await act(async () => {
        fireEvent.keyDown(button, { key: ' ', code: 'Space' });
        jest.runAllTimers();
      });

      await waitFor(() => {
        expect(button).toHaveAttribute('tabIndex', '0');
      });
    });

    it('should have proper color contrast', async () => {
      renderWithTheme(
        <HeadingBox
          heading={defaultHeadingBox.heading}
          description={defaultHeadingBox.description}
          preHeading={defaultHeadingBox.preHeading}
          cta={defaultHeadingBox.cta}
        />
      );

      await waitFor(() => {
        const heading = screen.getByRole('heading', { level: 2 });
        const description = screen.getByText(defaultHeadingBox.description!);
        const button = screen.getByRole('link', { name: defaultHeadingBox.cta!.label });

        expect(heading).toHaveStyle({
          color: expect.stringContaining('rgb'),
        });
        expect(description).toHaveStyle({
          color: expect.stringContaining('rgb'),
        });
        expect(button).toHaveStyle({
          color: expect.stringContaining('rgb'),
        });
      });
    });
  });

  describe('Functionality', () => {
    it('should render default heading box', async () => {
      renderWithTheme(
        <HeadingBox
          heading={defaultHeadingBox.heading}
          description={defaultHeadingBox.description}
          preHeading={defaultHeadingBox.preHeading}
          cta={defaultHeadingBox.cta}
        />
      );

      await waitFor(() => {
        expect(screen.getByText(defaultHeadingBox.preHeading!)).toBeInTheDocument();
        expect(screen.getByText(defaultHeadingBox.heading!)).toBeInTheDocument();
        expect(screen.getByText(defaultHeadingBox.description!)).toBeInTheDocument();
        expect(screen.getByText(defaultHeadingBox.cta!.label)).toBeInTheDocument();
      });
    });

    it('should hide description on mobile view', async () => {
      mockMobileViewport();
      renderWithTheme(<HeadingBox {...defaultHeadingBox} />);
      
      await waitFor(() => {
        const description = screen.getByText(defaultHeadingBox.description!);
        expect(description).toHaveStyle({ opacity: '0' });
      });
    });
  });
}); 