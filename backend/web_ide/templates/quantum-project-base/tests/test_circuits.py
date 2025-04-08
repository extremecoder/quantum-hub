"""
Tests for quantum circuits.

This module contains tests for the quantum circuits implemented in the project.
"""

import pytest
import numpy as np
from qiskit import Aer, execute
from qiskit.quantum_info import Statevector

from src.circuits.example_circuit import create_bell_state, simulate_bell_state


def test_bell_state_creation():
    """Test that the Bell state circuit is created with the correct structure."""
    # Create the Bell state circuit
    bell_circuit = create_bell_state()
    
    # Check circuit has the right number of qubits and classical bits
    assert bell_circuit.num_qubits == 2, "Bell circuit should have 2 qubits"
    assert bell_circuit.num_clbits == 2, "Bell circuit should have 2 classical bits"
    
    # Check the circuit contains the expected gates
    # Get operation names
    op_names = [inst[0].name for inst in bell_circuit.data]
    
    # Check for Hadamard gate
    assert 'h' in op_names, "Bell circuit should contain a Hadamard gate"
    
    # Check for CNOT gate
    assert 'cx' in op_names, "Bell circuit should contain a CNOT gate"
    
    # Check for measurement
    assert 'measure' in op_names, "Bell circuit should include measurements"


def test_bell_state_statevector():
    """Test that the Bell state circuit produces the correct statevector before measurement."""
    # Create the Bell state circuit without measurement
    bell_circuit = create_bell_state()
    
    # Remove the measurement operations
    bell_circuit_without_measure = bell_circuit.remove_final_measurements(inplace=False)
    
    # Simulate the statevector
    simulator = Aer.get_backend('statevector_simulator')
    result = execute(bell_circuit_without_measure, simulator).result()
    statevector = result.get_statevector()
    
    # Expected statevector for Bell state (|00⟩ + |11⟩)/√2
    # In the computational basis, this is [1/√2, 0, 0, 1/√2]
    expected_sv = np.array([1/np.sqrt(2), 0, 0, 1/np.sqrt(2)])
    
    # Check if statevectors are close (allowing for numerical precision issues)
    assert np.allclose(statevector, expected_sv), "Bell state statevector is incorrect"


def test_bell_state_simulation():
    """Test that the Bell state simulation returns the expected distribution."""
    # Run the simulation
    counts = simulate_bell_state(shots=1024)
    
    # A perfect Bell state would give 50% |00⟩ and 50% |11⟩
    # Due to sampling randomness, we check if the counts are reasonably distributed
    assert '00' in counts, "Bell state should have '00' in the results"
    assert '11' in counts, "Bell state should have '11' in the results"
    
    # Check other states have minimal counts (can occasionally appear due to simulator noise)
    assert counts.get('01', 0) < 50, "Bell state should rarely measure '01'"
    assert counts.get('10', 0) < 50, "Bell state should rarely measure '10'"
    
    # Check that 00 and 11 are roughly balanced
    total_counts = sum(counts.values())
    assert abs(counts['00'] / total_counts - 0.5) < 0.1, "Bell state should give approximately 50% '00'"
    assert abs(counts['11'] / total_counts - 0.5) < 0.1, "Bell state should give approximately 50% '11'"


def test_bell_state_edge_case():
    """Test edge case with very few shots."""
    # Run with minimum shots
    counts = simulate_bell_state(shots=1)
    
    # With only one shot, we should get exactly one result
    assert sum(counts.values()) == 1, "Single shot should give exactly one count"
    
    # The result should be either 00 or 11
    assert list(counts.keys())[0] in ['00', '11'], "Single shot of Bell state should measure '00' or '11'"
