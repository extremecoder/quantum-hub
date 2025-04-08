"""
Tests for quantum algorithms.

This module contains tests for the quantum algorithms implemented in the project.
"""

import pytest
import numpy as np
from qiskit import Aer, QuantumCircuit

from src.algorithms.example_algorithm import (
    create_oracle,
    create_diffuser,
    run_grover_algorithm
)


def test_oracle_creation():
    """Test that the oracle is created correctly for a specific marked element."""
    # Parameters for the test
    num_qubits = 3
    marked_element = 5  # binary: 101
    
    # Create the oracle
    oracle = create_oracle(marked_element, num_qubits)
    
    # Check basic properties
    assert isinstance(oracle, QuantumCircuit), "Oracle should be a QuantumCircuit"
    assert oracle.num_qubits == num_qubits, f"Oracle should have {num_qubits} qubits"
    
    # A more thorough test would check the oracle's action on statevectors,
    # but this is a simplified test


def test_diffuser_creation():
    """Test that the diffuser is created correctly."""
    # Parameters for the test
    num_qubits = 3
    
    # Create the diffuser
    diffuser = create_diffuser(num_qubits)
    
    # Check basic properties
    assert isinstance(diffuser, QuantumCircuit), "Diffuser should be a QuantumCircuit"
    assert diffuser.num_qubits == num_qubits, f"Diffuser should have {num_qubits} qubits"
    
    # The diffuser should have Hadamard gates - check the instruction names
    op_names = [inst[0].name for inst in diffuser.data]
    assert 'h' in op_names, "Diffuser should contain Hadamard gates"
    assert 'x' in op_names, "Diffuser should contain X gates"


def test_grover_algorithm():
    """Test that Grover's algorithm finds the marked element with high probability."""
    # Parameters for the test - using a small number of qubits for fast testing
    num_qubits = 2
    marked_element = 3  # binary: 11
    
    # Run Grover's algorithm
    counts = run_grover_algorithm(marked_element, num_qubits)
    
    # Convert the marked element to its binary representation (as a string)
    marked_state = format(marked_element, f'0{num_qubits}b')
    
    # Check that the marked element has the highest probability
    assert marked_state in counts, f"Marked state {marked_state} should appear in the results"
    
    # Calculate the probability of measuring the marked state
    total_counts = sum(counts.values())
    marked_probability = counts[marked_state] / total_counts
    
    # For 2 qubits, Grover's should find the answer with high probability
    assert marked_probability > 0.7, f"Grover's algorithm should find state {marked_state} with high probability"


def test_grover_multiple_iterations():
    """Test that running Grover's algorithm with a custom number of iterations works."""
    # Parameters for the test
    num_qubits = 3
    marked_element = 6  # binary: 110
    num_iterations = 2  # Custom number of iterations
    
    # Run Grover's algorithm with custom iterations
    counts = run_grover_algorithm(marked_element, num_qubits, num_iterations)
    
    # Verify the results are returned in the expected format
    assert isinstance(counts, dict), "Results should be returned as a dictionary"
    assert all(len(state) == num_qubits for state in counts.keys()), "All states should have the correct length"
    
    # We don't check the exact probabilities here since that would depend on
    # the specific number of iterations relative to the optimal number


def test_grover_edge_case():
    """Test Grover's algorithm with edge case parameters."""
    # Single qubit test (trivial case, but should still work)
    num_qubits = 1
    marked_element = 1  # binary: 1
    
    # Run Grover's algorithm
    counts = run_grover_algorithm(marked_element, num_qubits)
    
    # In this trivial case, the result should be deterministic
    assert '1' in counts, "For a single qubit, marked element 1 should be found"
    assert counts.get('1', 0) > counts.get('0', 0), "Marked element should have higher probability"
