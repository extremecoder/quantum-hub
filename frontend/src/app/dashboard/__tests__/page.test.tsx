import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Dashboard from '../page';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

// Mock heroicons
jest.mock('@heroicons/react/outline', () => ({
  ChartBarIcon: () => <svg data-testid="chart-bar-icon" />,
  ClockIcon: () => <svg data-testid="clock-icon" />,
  CogIcon: () => <svg data-testid="cog-icon" />,
  CollectionIcon: () => <svg data-testid="collection-icon" />,
  ServerIcon: () => <svg data-testid="server-icon" />,
  BadgeCheckIcon: () => <svg data-testid="badge-check-icon" />,
  ExclamationCircleIcon: () => <svg data-testid="exclamation-circle-icon" />,
  PauseIcon: () => <svg data-testid="pause-icon" />,
}));

describe('Dashboard Component', () => {
  it('renders the dashboard page', () => {
    render(<Dashboard />);
    
    // Check for dashboard title
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    
    // Check page contains expected description
    expect(screen.getByText('Manage your quantum applications and monitor resource usage')).toBeInTheDocument();
  });

  it('displays navigation tabs', () => {
    render(<Dashboard />);
    
    // Check for tab names
    expect(screen.getByText('My Applications')).toBeInTheDocument();
    expect(screen.getByText('Hardware Usage')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('displays user applications', () => {
    render(<Dashboard />);
    
    // Check for application names using getAllByText to handle multiple occurrences
    const searchAppElements = screen.getAllByText('Quantum Search Algorithm');
    const vqeAppElements = screen.getAllByText('VQE Molecular Simulation');
    
    expect(searchAppElements.length).toBeGreaterThan(0);
    expect(vqeAppElements.length).toBeGreaterThan(0);
  });

  it('contains details buttons for applications', () => {
    render(<Dashboard />);
    
    // Check for view details links
    const detailsLinks = screen.getAllByText('View Details');
    expect(detailsLinks.length).toBeGreaterThan(0);
    
    // Check for run buttons
    const runButtons = screen.getAllByText('Run');
    expect(runButtons.length).toBeGreaterThan(0);
  });

  it('allows creating new applications', () => {
    render(<Dashboard />);
    
    // Check for new application button
    const newAppButton = screen.getByText('New Application');
    expect(newAppButton).toBeInTheDocument();
  });
}); 