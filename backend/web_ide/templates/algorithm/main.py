"""
Quantum Algorithm Example
------------------------
This is a sample quantum algorithm project that demonstrates
the implementation and analysis of quantum algorithms.
"""

import numpy as np
from qiskit import QuantumCircuit
from qiskit.algorithms import Grover, AmplificationProblem
from qiskit.primitives import Sampler

def create_oracle(n_qubits, marked_states):
    """
    Creates a phase oracle for Grover's algorithm that marks specified states.
    
    Args:
        n_qubits (int): Number of qubits
        marked_states (list): List of bit strings to mark with a phase flip
        
    Returns:
        QuantumCircuit: Oracle circuit
    """
    oracle = QuantumCircuit(n_qubits)
    
    for marked_state in marked_states:
        # Convert marked state to a list of 0s and 1s
        marked_state_list = [int(bit) for bit in marked_state]
        
        # Apply X gates to the qubits where the marked state has a 0
        for i in range(n_qubits):
            if marked_state_list[i] == 0:
                oracle.x(i)
        
        # Apply multi-controlled Z gate
        oracle.h(n_qubits - 1)
        oracle.mcx(list(range(n_qubits - 1)), n_qubits - 1)
        oracle.h(n_qubits - 1)
        
        # Apply X gates again to the qubits where the marked state has a 0
        for i in range(n_qubits):
            if marked_state_list[i] == 0:
                oracle.x(i)
    
    return oracle

def run_grover_algorithm(n_qubits, marked_states):
    """
    Runs Grover's algorithm to find marked states.
    
    Args:
        n_qubits (int): Number of qubits
        marked_states (list): List of bit strings to mark with a phase flip
        
    Returns:
        dict: Measurement results with counts
    """
    oracle = create_oracle(n_qubits, marked_states)
    
    # Define the Grover operator
    problem = AmplificationProblem(oracle, is_good_state=lambda x: x in marked_states)
    
    # Run Grover's algorithm
    grover = Grover(sampler=Sampler())
    result = grover.amplify(problem)
    
    return result.circuit_results[0]

def main():
    """Main function to demonstrate Grover's algorithm."""
    # Define problem parameters
    n_qubits = 3
    marked_states = ['101']  # We want to find the state |101⟩
    
    print(f"Running Grover's algorithm to find marked states: {marked_states}")
    print(f"Using {n_qubits} qubits, there are {2**n_qubits} possible states.")
    
    # Run Grover's algorithm
    result = run_grover_algorithm(n_qubits, marked_states)
    
    print("\nMeasurement Results:")
    for state, count in result.items():
        print(f"State {state}: {count} counts")
    
    # Check if we found the marked state
    success = any(state in marked_states for state in result.keys())
    if success:
        print("\nSuccess! Grover's algorithm found the marked state.")
    else:
        print("\nThe algorithm didn't find the marked state in the top measurements.")

if __name__ == "__main__":
    main()
