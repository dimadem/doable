
import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatusIndicator } from '../../components/StatusIndicator';

describe('StatusIndicator', () => {
  it('displays the current status', () => {
    render(<StatusIndicator status="idle" />);
    expect(screen.getByText('idle')).toBeInTheDocument();
  });

  it('shows different statuses', () => {
    const { rerender } = render(<StatusIndicator status="idle" />);
    expect(screen.getByText('idle')).toBeInTheDocument();

    rerender(<StatusIndicator status="connecting" />);
    expect(screen.getByText('connecting')).toBeInTheDocument();

    rerender(<StatusIndicator status="processing" />);
    expect(screen.getByText('processing')).toBeInTheDocument();

    rerender(<StatusIndicator status="responding" />);
    expect(screen.getByText('responding')).toBeInTheDocument();
  });
});
