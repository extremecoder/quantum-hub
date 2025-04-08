"""
Example quantum circuit demonstrating a Bell state.

This module contains an example implementation of a Bell state circuit,
which creates quantum entanglement between two qubits.
"""

from qiskit import QuantumCircuit, transpile
from qiskit.visualization import plot_histogram
from qiskit.providers.aer import AerSimulator
import matplotlib.pyplot as plt
import numpy as np


def create_bell_state() -> QuantumCircuit:
    """
    Create a Bell state (Φ+) circuit.
    
    Creates a quantum circuit that entangles two qubits in the Bell state
    |Φ+⟩ = (|00⟩ + |11⟩)/√2
    
    Returns:
        QuantumCircuit: A quantum circuit implementing the Bell state
    """
    # Create a circuit with 2 qubits and 2 classical bits
    circuit = QuantumCircuit(2, 2)
    
    # Apply Hadamard gate to the first qubit
    circuit.h(0)
    
    # Apply CNOT with control qubit 0 and target qubit 1
    circuit.cx(0, 1)
    
    # Measure both qubits
    circuit.measure([0, 1], [0, 1])
    
    return circuit


def simulate_bell_state(shots: int = 1024) -> dict:
    """
    Simulate the Bell state circuit and return measurement results.
    
    Args:
        shots: Number of times to run the simulation
        
    Returns:
        dict: Counts of measurement results
    """
    # Create the circuit
    bell_circuit = create_bell_state()
    
    # Set up the simulator
    simulator = AerSimulator()
    
    # Transpile the circuit for the simulator
    transpiled_circuit = transpile(bell_circuit, simulator)
    
    # Run the simulation
    result = simulator.run(transpiled_circuit, shots=shots).result()
    
    # Get the counts
    counts = result.get_counts()
    
    return counts


def visualize_bell_state(counts: dict = None, shots: int = 1024) -> None:
    """
    Visualize the results of the Bell state simulation.
    
    Args:
        counts: Measurement counts from the simulation
        shots: Number of shots to use if counts not provided
        
    Returns:
        None: Displays the histogram plot
    """
    if counts is None:
        counts = simulate_bell_state(shots)
    
    # Plot the results
    plot_histogram(counts)
    plt.title('Bell State Measurement Results')
    plt.show()


if __name__ == "__main__":
    # Run the simulation
    result_counts = simulate_bell_state()
    print("Measurement counts:", result_counts)
    
    # Visualize the results
    visualize_bell_state(result_counts)
