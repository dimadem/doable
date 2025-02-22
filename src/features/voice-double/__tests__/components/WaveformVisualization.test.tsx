
import React from 'react';
import { render } from '@testing-library/react';
import { WaveformVisualization } from '../../components/WaveformVisualization';

describe('WaveformVisualization', () => {
  it('renders with inactive state', () => {
    const { container } = render(<WaveformVisualization isActive={false} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders with active state', () => {
    const { container } = render(<WaveformVisualization isActive={true} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
