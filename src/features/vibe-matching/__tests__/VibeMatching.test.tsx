
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import VibeMatching from '../pages/VibeMatching';
import { usePersonalities } from '../hooks/usePersonalities';

// Mock the hooks and services
jest.mock('../hooks/usePersonalities');
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('VibeMatching', () => {
  beforeEach(() => {
    (usePersonalities as jest.Mock).mockReturnValue({
      personalities: [
        {
          id: '1',
          name: 'Type A',
          url_array: ['image1.jpg', 'image2.jpg', 'image3.jpg']
        },
        {
          id: '2',
          name: 'Type B',
          url_array: ['image4.jpg', 'image5.jpg', 'image6.jpg']
        }
      ],
      loading: false,
      error: null
    });
  });

  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <VibeMatching />
      </BrowserRouter>
    );
    expect(screen.getByText('check the vibe')).toBeInTheDocument();
  });

  it('shows loading state when loading', () => {
    (usePersonalities as jest.Mock).mockReturnValue({
      personalities: [],
      loading: true,
      error: null
    });

    render(
      <BrowserRouter>
        <VibeMatching />
      </BrowserRouter>
    );
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error state when there is an error', () => {
    (usePersonalities as jest.Mock).mockReturnValue({
      personalities: [],
      loading: false,
      error: 'Failed to load personalities'
    });

    render(
      <BrowserRouter>
        <VibeMatching />
      </BrowserRouter>
    );
    expect(screen.getByText('Error Loading Personalities')).toBeInTheDocument();
  });
});
