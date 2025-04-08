"""
Example quantum algorithm implementing Grover's search.

This module contains a simplified implementation of Grover's search algorithm,
which demonstrates quantum speedup for the unstructured search problem.
"""

from qiskit import QuantumCircuit, transpile, Aer
from qiskit.visualization import plot_histogram
from qiskit.algorithms import AmplificationProblem, Grover
from qiskit.quantum_info import Statevector
import matplotlib.pyplot as plt
from typing import List, Dict, Tuple, Optional, Union


def create_oracle(marked_element: int, num_qubits: int) -> QuantumCircuit:
    """
    Create a quantum oracle that marks a specific binary string.
    
    The oracle applies a phase flip to the marked element.
    
    Args:
        marked_element: The integer representing the bit string to mark
        num_qubits: Number of qubits in the system
        
    Returns:
        QuantumCircuit: A quantum circuit implementing the oracle
    """
    # Initialize an empty quantum circuit
    oracle_circuit = QuantumCircuit(num_qubits)
    
    # Convert the marked element to binary format and pad to num_qubits
    binary_string = format(marked_element, f'0{num_qubits}b')
    
    # Apply X gates to qubits that should be 0 in the marked state
    for i in range(num_qubits):
        if binary_string[i] == '0':
            oracle_circuit.x(i)
    
    # Apply multi-controlled Z gate
    oracle_circuit.h(num_qubits - 1)
    oracle_circuit.mcx(list(range(num_qubits - 1)), num_qubits - 1)
    oracle_circuit.h(num_qubits - 1)
    
    # Apply X gates again to return to original basis
    for i in range(num_qubits):
        if binary_string[i] == '0':
            oracle_circuit.x(i)
    
    return oracle_circuit


def create_diffuser(num_qubits: int) -> QuantumCircuit:
    """
    Create a diffusion operator for Grover's algorithm.
    
    The diffuser performs an inversion about the mean.
    
    Args:
        num_qubits: Number of qubits in the system
        
    Returns:
        QuantumCircuit: A quantum circuit implementing the diffuser
    """
    # Initialize circuit
    diffuser = QuantumCircuit(num_qubits)
    
    # Apply H gates to all qubits
    for qubit in range(num_qubits):
        diffuser.h(qubit)
    
    # Apply X gates to all qubits
    for qubit in range(num_qubits):
        diffuser.x(qubit)
    
    # Apply multi-controlled Z gate (inversion about zero)
    diffuser.h(num_qubits - 1)
    diffuser.mcx(list(range(num_qubits - 1)), num_qubits - 1)
    diffuser.h(num_qubits - 1)
    
    # Apply X gates to all qubits
    for qubit in range(num_qubits):
        diffuser.x(qubit)
    
    # Apply H gates to all qubits
    for qubit in range(num_qubits):
        diffuser.h(qubit)
    
    return diffuser


def run_grover_algorithm(
    marked_element: int, 
    num_qubits: int, 
    num_iterations: Optional[int] = None
) -> Dict[str, int]:
    """
    Run Grover's search algorithm to find the marked element.
    
    Args:
        marked_element: The element to search for
        num_qubits: Number of qubits to use
        num_iterations: Number of Grover iterations (optimal = π/4 * sqrt(N))
        
    Returns:
        dict: Measurement results
    """
    # Calculate optimal number of iterations if not specified
    if num_iterations is None:
        N = 2**num_qubits
        num_iterations = int(0.785 * (N ** 0.5))  # π/4 * sqrt(N)
    
    # Create the quantum circuit
    grover_circuit = QuantumCircuit(num_qubits, num_qubits)
    
    # Initialize with Hadamard gates
    for qubit in range(num_qubits):
        grover_circuit.h(qubit)
    
    # Create oracle
    oracle = create_oracle(marked_element, num_qubits)
    
    # Create diffuser
    diffuser = create_diffuser(num_qubits)
    
    # Apply Grover iterations
    for _ in range(num_iterations):
        grover_circuit = grover_circuit.compose(oracle)
        grover_circuit = grover_circuit.compose(diffuser)
    
    # Measure all qubits
    grover_circuit.measure(range(num_qubits), range(num_qubits))
    
    # Simulate the circuit
    simulator = Aer.get_backend('qasm_simulator')
    compiled_circuit = transpile(grover_circuit, simulator)
    job = simulator.run(compiled_circuit, shots=1024)
    result = job.result()
    
    # Get the measurement counts
    counts = result.get_counts(grover_circuit)
    
    return counts


def visualize_grover_results(counts: Dict[str, int]) -> None:
    """
    Visualize the results of Grover's algorithm.
    
    Args:
        counts: Measurement counts from the simulation
        
    Returns:
        None: Displays the histogram plot
    """
    plot_histogram(counts)
    plt.title('Grover\'s Algorithm Results')
    plt.show()


if __name__ == "__main__":
    # Set up parameters
    num_qubits = 3
    marked_element = 6  # Binary: 110
    
    # Run Grover's algorithm
    results = run_grover_algorithm(marked_element, num_qubits)
    
    # Print the results
    print(f"Searching for element {marked_element} ({format(marked_element, f'0{num_qubits}b')})")
    print("Measurement counts:", results)
    
    # Visualize the results
    visualize_grover_results(results)
