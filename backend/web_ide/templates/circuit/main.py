"""
 Circuit Exam-----------
Thiample quantum circuit project that demonstrates
the creation and manipulation of quantum circuits.
"""

import numpy as np
from qiskit import QuantumCircuit, QuantumRegister, ClassicalRegister
from qiskit import Aer, execute

def create_bell_state():
    """
    Creates a quantum circuit implementing a Bell state.
    
    Returns:
        QuantumCircuit: A circuit implementing the Bell state
    """
    # Create quantum and classical registers
    qr = QuantumRegister(2, name="q")
    cr = ClassicalRegister(2, name="c")
    
    # Create a quantum circuit
    circuit = QuantumCircuit(qr, cr)
    
    # Create superposition
    circuit.h(qr[0])
    
    # Entangle qubits
    circuit.cx(qr[0], qr[1])
    
    # Measure qubits
    circuit.measure(qr, cr)
    
    return circuit

def run_circuit(circuit):
    """
    Runs the given quantum circuit on a simulator.
    
    Args:
        circuit (QuantumCircuit): The quantum circuit to run
        
    Returns:
        dict: Counts of measurement results
    """
    simulator = Aer.get_backend('qasm_simulator')
    job = execute(circuit, simulator, shots=1024)
    result = job.result()
    counts = result.get_counts(circuit)
    return counts

def main():
    """Main function to run a Bell state experiment."""
    # Create Bell state circuit
    bell_circuit = create_bell_state()
    
    # Print circuit
    print("Bell State Circuit:")
    print(bell_circuit)
    
    # Run circuit and get counts
    counts = run_circuit(bell_circuit)
    
    # Print results
    print("\nMeasurement Results:")
    print(counts)
    
    # Calculate theoretical probabilities
    total_shots = sum(counts.values())
    probabilities = {key: value / total_shots for key, value in counts.items()}
    
    print("\nProbabilities:")
    for state, prob in probabilities.items():
        print(f"State {state}: {prob:.4f}")

if __name__ == "__main__":
    main()
