import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import QuantumAppsTab from '../QuantumAppsTab';
import * as quantumAppService from '../../../services/quantumAppService';

// Mock the quantumAppService
jest.mock('../../../services/quantumAppService', () => ({
  getQuantumApps: jest.fn(),
  uploadQuantumAppPackage: jest.fn(),
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

describe('QuantumAppsTab Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders loading state initially', () => {
    // Mock the getQuantumApps function to return a promise that doesn't resolve immediately
    (quantumAppService.getQuantumApps as jest.Mock).mockReturnValue(new Promise(() => {}));
    
    render(<QuantumAppsTab />);
    
    expect(screen.getByText('Loading applications...')).toBeInTheDocument();
  });

  it('renders empty state when no quantum apps are found', async () => {
    // Mock the getQuantumApps function to return an empty array
    (quantumAppService.getQuantumApps as jest.Mock).mockResolvedValue([]);
    
    render(<QuantumAppsTab />);
    
    // Wait for the loading state to be replaced with the empty state
    await waitFor(() => {
      expect(screen.getByText('No quantum applications found')).toBeInTheDocument();
    });
    
    expect(screen.getByText('You haven\'t created any quantum applications yet.')).toBeInTheDocument();
    expect(screen.getByText('Upload Package')).toBeInTheDocument();
    expect(screen.getByText('Create New Application')).toBeInTheDocument();
  });

  it('renders quantum apps when they are available', async () => {
    // Mock quantum apps data
    const mockApps = [
      {
        id: 'app-1',
        name: 'Test Quantum App',
        description: 'A test quantum app',
        type: 'CIRCUIT',
        status: 'ACTIVE',
        visibility: 'PRIVATE',
        developer_id: 'user-1',
        created_at: '2023-06-15T10:30:00Z',
        updated_at: '2023-06-15T10:30:00Z',
      },
    ];
    
    // Mock the getQuantumApps function to return the mock data
    (quantumAppService.getQuantumApps as jest.Mock).mockResolvedValue(mockApps);
    
    render(<QuantumAppsTab />);
    
    // Wait for the apps to be displayed
    await waitFor(() => {
      expect(screen.getByText('Test Quantum App')).toBeInTheDocument();
    });
    
    expect(screen.getByText('A test quantum app')).toBeInTheDocument();
    expect(screen.getByText('circuit')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('private')).toBeInTheDocument();
  });

  it('opens the upload modal when the upload button is clicked', async () => {
    // Mock the getQuantumApps function to return an empty array
    (quantumAppService.getQuantumApps as jest.Mock).mockResolvedValue([]);
    
    render(<QuantumAppsTab />);
    
    // Wait for the component to finish loading
    await waitFor(() => {
      expect(screen.queryByText('Loading applications...')).not.toBeInTheDocument();
    });
    
    // Click the upload button
    fireEvent.click(screen.getByText('Upload Package'));
    
    // Check if the modal is displayed
    expect(screen.getByText('Upload Quantum App Package')).toBeInTheDocument();
    expect(screen.getByText('Upload a zip file containing your quantum app package with a quantum_manifest.json file and .qasm files.')).toBeInTheDocument();
  });
});
