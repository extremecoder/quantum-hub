"""
Project: proj-122
Description: Quantum Circuit Implementation Example
"""

import numpy as np
from qiskit import QuantumCircuit, Aer, execute
from qiskit.visualization import plot_histogram

def create_ghz_state(num_qubits):
    """
    Create a GHZ state quantum circuit.
    
    Args:
        num_qubits (int): Number of qubits for the GHZ state
        
    Returns:
        QuantumCircuit: A circuit implementing the GHZ state
    """
    # Create a quantum circuit with num_qubits
    circuit = QuantumCircuit(num_qubits, num_qubits)
    
    # Apply H-gate to the first qubit
    circuit.h(0)
    
    # Apply CNOT gates to entangle all qubits
    for i in range(num_qubits - 1):
        circuit.cx(i, i + 1)
    
    # Measure all qubits
    circuit.measure(range(num_qubits), range(num_qubits))
    
    return circuit

def run_circuit(circuit, shots=1024):
    """
    Run the circuit on a simulator and return the results.
    
    Args:
        circuit (QuantumCircuit): The quantum circuit to run
        shots (int): Number of times to run the circuit
        
    Returns:
        dict: Results of the experiment
    """
    # Use the Aer simulator
    simulator = Aer.get_backend('qasm_simulator')
    
    # Execute the circuit
    job = execute(circuit, simulator, shots=shots)
    
    # Get the results
    result = job.result()
    counts = result.get_counts(circuit)
    
    return counts

def main():
    """Main function demonstrating a GHZ state experiment."""
    # Create a 3-qubit GHZ state
    num_qubits = 3
    circuit = create_ghz_state(num_qubits)
    
    # Print the circuit
    print("Quantum Circuit:")
    print(circuit)
    
    # Run the circuit
    counts = run_circuit(circuit)
    
    # Print results
    print("\nMeasurement Results:")
    for state, count in counts.items():
        print(f"State |{state}⟩: {count} counts")
    
    # Calculate probabilities
    total_shots = sum(counts.values())
    print("\nProbabilities:")
    for state, count in counts.items():
        prob = count / total_shots
        print(f"P(|{state}⟩) = {prob:.4f}")
    
    print("\nExpected result: equal probabilities for |000⟩ and |111⟩ states")

if __name__ == "__main__":
    main()
