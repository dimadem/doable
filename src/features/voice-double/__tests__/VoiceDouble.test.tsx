
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import VoiceDouble from '../pages/VoiceDouble';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('VoiceDouble', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <VoiceDouble />
      </BrowserRouter>
    );
    expect(screen.getByText('voice double')).toBeInTheDocument();
  });

  it('starts in idle state', () => {
    render(
      <BrowserRouter>
        <VoiceDouble />
      </BrowserRouter>
    );
    expect(screen.getByText('start')).toBeInTheDocument();
    expect(screen.getByText('idle')).toBeInTheDocument();
  });

  it('changes state when start button is clicked', () => {
    render(
      <BrowserRouter>
        <VoiceDouble />
      </BrowserRouter>
    );
    
    const startButton = screen.getByText('start');
    fireEvent.click(startButton);
    
    // We should see the connecting state
    expect(screen.getByText('connecting')).toBeInTheDocument();
  });
});
