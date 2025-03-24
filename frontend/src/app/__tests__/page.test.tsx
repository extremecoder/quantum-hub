import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Home from '../page';

// Mock Next.js Link component
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
});

describe('Home Component', () => {
  it('renders the homepage correctly', () => {
    render(<Home />);
    
    // Check for main headings
    expect(screen.getByText('Quantum Hub')).toBeInTheDocument();
    expect(screen.getByText('Discover, deploy, and run quantum applications on real quantum hardware')).toBeInTheDocument();
    
    // Check for sections
    expect(screen.getByText('Browse by Category')).toBeInTheDocument();
    expect(screen.getByText('Featured Quantum Applications')).toBeInTheDocument();
    expect(screen.getByText('Ready to Build Your Own Quantum Application?')).toBeInTheDocument();
  });

  it('displays all category cards', () => {
    render(<Home />);
    
    // Check for all category names - getting the heading elements specifically
    const factorizationHeading = screen.getAllByText('Factorization').find(
      el => el.tagName.toLowerCase() === 'h3'
    );
    const chemistryHeading = screen.getAllByText('Chemistry').find(
      el => el.tagName.toLowerCase() === 'h3'
    );
    const mlHeading = screen.getAllByText('Machine Learning').find(
      el => el.tagName.toLowerCase() === 'h3'
    );
    const utilitiesHeading = screen.getAllByText('Utilities').find(
      el => el.tagName.toLowerCase() === 'h3'
    );
    
    expect(factorizationHeading).toBeInTheDocument();
    expect(chemistryHeading).toBeInTheDocument();
    expect(mlHeading).toBeInTheDocument();
    expect(utilitiesHeading).toBeInTheDocument();
  });

  it('displays all featured applications', () => {
    render(<Home />);
    
    // Check for all application titles
    expect(screen.getByText("Shor's Algorithm - Factor 15")).toBeInTheDocument();
    expect(screen.getByText('VQE - H2 Molecule')).toBeInTheDocument();
    expect(screen.getByText('Quantum ML - Iris Classification')).toBeInTheDocument();
    expect(screen.getByText('Quantum Random Number Generator')).toBeInTheDocument();
  });

  it('handles search input correctly', () => {
    render(<Home />);
    
    // Get the search input and type in it
    const searchInput = screen.getByPlaceholderText('Search quantum applications...');
    fireEvent.change(searchInput, { target: { value: 'test search' } });
    
    // Check if the input value has changed
    expect(searchInput).toHaveValue('test search');
  });

  it('contains correct call-to-action buttons', () => {
    render(<Home />);
    
    // Check for CTA buttons
    const getStartedButton = screen.getByText('Get Started');
    const docsButton = screen.getByText('View Documentation');
    
    expect(getStartedButton).toBeInTheDocument();
    expect(docsButton).toBeInTheDocument();
    
    // Check if they have correct href attributes
    expect(getStartedButton.closest('a')).toHaveAttribute('href', '/docs/getting-started');
    expect(docsButton.closest('a')).toHaveAttribute('href', '/docs');
  });
}); 