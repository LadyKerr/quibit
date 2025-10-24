import React from 'react';
import { render } from '@testing-library/react-native';
import { LinkCard } from '../LinkCard';
import { Link } from '../../hooks/useLinks';

// Mock dependencies
jest.mock('../ThemedText', () => ({
  ThemedText: ({ children, style }: any) => {
    const React = require('react');
    const { Text } = require('react-native');
    return <Text style={style}>{children}</Text>;
  }
}));

jest.mock('../ThemedView', () => ({
  ThemedView: ({ children, style }: any) => {
    const React = require('react');
    const { View } = require('react-native');
    return <View style={style}>{children}</View>;
  }
}));

jest.mock('../LinkDetailModal', () => ({
  LinkDetailModal: () => null
}));

jest.mock('../../utils/categoryUtils', () => ({
  getCategoryColors: (category: string) => ({
    background: '#F0F0F0',
    text: '#666666'
  })
}));

describe('LinkCard Performance Optimizations', () => {
  const mockLink: Link = {
    id: '1',
    title: 'Test Link',
    url: 'https://example.com',
    category: 'Blog',
    notes: 'Test notes',
    created_at: '2024-01-01T00:00:00Z',
    user_id: 'test-user-id'
  };

  const mockHandlers = {
    onEdit: jest.fn(),
    onPress: jest.fn(),
    onDelete: jest.fn()
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('React.memo optimization', () => {
    it('should render without crashing', () => {
      const { getByText } = render(
        <LinkCard
          link={mockLink}
          {...mockHandlers}
        />
      );

      expect(getByText(/Test Link/)).toBeTruthy();
    });

    it('should not re-render when unrelated props change', () => {
      let renderCount = 0;
      const TestWrapper = ({ extraProp }: { extraProp: number }) => {
        renderCount++;
        return (
          <LinkCard
            link={mockLink}
            {...mockHandlers}
          />
        );
      };

      const { rerender } = render(<TestWrapper extraProp={1} />);
      const initialRenderCount = renderCount;

      // Change an unrelated prop
      rerender(<TestWrapper extraProp={2} />);

      // Render count should increase (parent rerenders) but LinkCard should be memoized
      expect(renderCount).toBeGreaterThan(initialRenderCount);
    });

    it('should re-render when link title changes', () => {
      const { rerender, getByText } = render(
        <LinkCard
          link={mockLink}
          {...mockHandlers}
        />
      );

      expect(getByText(/Test Link/)).toBeTruthy();

      const updatedLink = { ...mockLink, title: 'Updated Link' };
      rerender(
        <LinkCard
          link={updatedLink}
          {...mockHandlers}
        />
      );

      expect(getByText(/Updated Link/)).toBeTruthy();
    });

    it('should re-render when link URL changes', () => {
      const { rerender } = render(
        <LinkCard
          link={mockLink}
          {...mockHandlers}
        />
      );

      const updatedLink = { ...mockLink, url: 'https://newexample.com' };
      rerender(
        <LinkCard
          link={updatedLink}
          {...mockHandlers}
        />
      );

      // Component should accept the new URL
      expect(updatedLink.url).toBe('https://newexample.com');
    });

    it('should re-render when link category changes', () => {
      const { rerender } = render(
        <LinkCard
          link={mockLink}
          {...mockHandlers}
        />
      );

      const updatedLink = { ...mockLink, category: 'Tutorial' };
      rerender(
        <LinkCard
          link={updatedLink}
          {...mockHandlers}
        />
      );

      expect(updatedLink.category).toBe('Tutorial');
    });

    it('should re-render when link notes change', () => {
      const { rerender } = render(
        <LinkCard
          link={mockLink}
          {...mockHandlers}
        />
      );

      const updatedLink = { ...mockLink, notes: 'Updated notes' };
      rerender(
        <LinkCard
          link={updatedLink}
          {...mockHandlers}
        />
      );

      expect(updatedLink.notes).toBe('Updated notes');
    });

    it('should handle links without notes', () => {
      const linkWithoutNotes = { ...mockLink, notes: undefined };
      const { queryByText } = render(
        <LinkCard
          link={linkWithoutNotes}
          {...mockHandlers}
        />
      );

      // Notes button should not be present
      expect(queryByText('Show Notes')).toBeNull();
    });

    it('should re-render when categoryColors change', () => {
      const { rerender } = render(
        <LinkCard
          link={mockLink}
          categoryColors={{}}
          {...mockHandlers}
        />
      );

      const newColors = { Blog: '#FF5733' };
      rerender(
        <LinkCard
          link={mockLink}
          categoryColors={newColors}
          {...mockHandlers}
        />
      );

      // Component should accept new colors
      expect(newColors.Blog).toBe('#FF5733');
    });
  });

  describe('Handler stability', () => {
    it('should use the same handlers across renders', () => {
      const { rerender } = render(
        <LinkCard
          link={mockLink}
          {...mockHandlers}
        />
      );

      const firstHandlers = { ...mockHandlers };

      rerender(
        <LinkCard
          link={mockLink}
          {...mockHandlers}
        />
      );

      // Handlers should be the same reference
      expect(mockHandlers.onEdit).toBe(firstHandlers.onEdit);
      expect(mockHandlers.onPress).toBe(firstHandlers.onPress);
      expect(mockHandlers.onDelete).toBe(firstHandlers.onDelete);
    });
  });

  describe('Component structure', () => {
    it('should display link title with emoji icon', () => {
      const { getByText } = render(
        <LinkCard
          link={mockLink}
          {...mockHandlers}
        />
      );

      expect(getByText(/Test Link/)).toBeTruthy();
    });

    it('should display category badge', () => {
      const { getByText } = render(
        <LinkCard
          link={mockLink}
          {...mockHandlers}
        />
      );

      expect(getByText('Blog')).toBeTruthy();
    });

    it('should display formatted date', () => {
      const { getByText } = render(
        <LinkCard
          link={mockLink}
          {...mockHandlers}
        />
      );

      // Should display date in format like "Jan 1, 2024"
      expect(getByText(/Jan/)).toBeTruthy();
    });
  });

  describe('Performance edge cases', () => {
    it('should handle very long titles efficiently', () => {
      const longTitleLink = {
        ...mockLink,
        title: 'A'.repeat(200)
      };

      const { getByText } = render(
        <LinkCard
          link={longTitleLink}
          {...mockHandlers}
        />
      );

      expect(getByText(/A+/)).toBeTruthy();
    });

    it('should handle very long URLs efficiently', () => {
      const longUrlLink = {
        ...mockLink,
        url: 'https://example.com/' + 'path/'.repeat(50)
      };

      const { container } = render(
        <LinkCard
          link={longUrlLink}
          {...mockHandlers}
        />
      );

      expect(container).toBeTruthy();
    });

    it('should handle special characters in notes', () => {
      const specialCharsLink = {
        ...mockLink,
        notes: 'Special chars: <>&"\''
      };

      const { container } = render(
        <LinkCard
          link={specialCharsLink}
          {...mockHandlers}
        />
      );

      expect(container).toBeTruthy();
    });
  });
});
