
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Struggle from '../pages/Struggle';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
}));

describe('Struggle', () => {
  it('renders without crashing', () => {
    render(
      <BrowserRouter>
        <Struggle />
      </BrowserRouter>
    );
    expect(screen.getByText('struggle')).toBeInTheDocument();
  });

  it('displays the hard task button', () => {
    render(
      <BrowserRouter>
        <Struggle />
      </BrowserRouter>
    );
    expect(screen.getByText('Hard Task')).toBeInTheDocument();
  });
});
