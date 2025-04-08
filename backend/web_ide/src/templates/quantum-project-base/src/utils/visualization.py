"""
Visualization utilities for quantum circuits and results.

This module provides helper functions to visualize quantum circuits,
statevectors, measurement results, and other quantum information.
"""

from typing import Dict, List, Optional, Union, Any
import numpy as np
import matplotlib.pyplot as plt
from qiskit import QuantumCircuit
from qiskit.visualization import plot_bloch_multivector, plot_state_city, plot_histogram
from qiskit.result import Result


def plot_circuit(
    circuit: QuantumCircuit, 
    output_file: Optional[str] = None,
    figsize: tuple = (10, 7)
) -> None:
    """
    Plot a quantum circuit with better formatting.
    
    Args:
        circuit: The quantum circuit to visualize
        output_file: If provided, save the figure to this file
        figsize: Figure size as (width, height) in inches
        
    Returns:
        None: Displays or saves the circuit diagram
    """
    fig = plt.figure(figsize=figsize)
    
    # Draw the circuit
    circuit.draw(output='mpl', style={'backgroundcolor': '#EEEEEE'})
    
    plt.title(f"Quantum Circuit: {circuit.name or 'Unnamed'}")
    
    if output_file:
        plt.savefig(output_file, bbox_inches='tight')
        print(f"Circuit diagram saved to {output_file}")
    else:
        plt.show()


def plot_state(
    statevector: np.ndarray,
    plot_type: str = 'bloch',
    title: Optional[str] = None,
    output_file: Optional[str] = None,
    figsize: tuple = (10, 7)
) -> None:
    """
    Visualize a quantum state using different visualization methods.
    
    Args:
        statevector: The quantum state to visualize
        plot_type: Type of plot ('bloch', 'city', 'histogram')
        title: Title for the plot
        output_file: If provided, save the figure to this file
        figsize: Figure size as (width, height) in inches
        
    Returns:
        None: Displays or saves the state visualization
    """
    fig = plt.figure(figsize=figsize)
    
    if plot_type == 'bloch':
        plot_bloch_multivector(statevector)
        plot_title = title or "Bloch Sphere Representation"
    elif plot_type == 'city':
        plot_state_city(statevector)
        plot_title = title or "City Plot Representation"
    elif plot_type == 'histogram':
        # Generate labels for each basis state
        num_qubits = int(np.log2(len(statevector)))
        labels = [format(i, f'0{num_qubits}b') for i in range(2**num_qubits)]
        
        # Calculate probabilities
        probabilities = np.abs(statevector)**2
        
        plt.bar(labels, probabilities)
        plt.xlabel('Basis State')
        plt.ylabel('Probability')
        plt.xticks(rotation=70)
        plot_title = title or "State Probabilities"
    else:
        raise ValueError(f"Unknown plot type: {plot_type}")
    
    plt.title(plot_title)
    
    if output_file:
        plt.savefig(output_file, bbox_inches='tight')
        print(f"State visualization saved to {output_file}")
    else:
        plt.show()


def plot_results(
    counts: Dict[str, int],
    figsize: tuple = (12, 6),
    title: Optional[str] = None,
    output_file: Optional[str] = None
) -> None:
    """
    Create an enhanced histogram of measurement results.
    
    Args:
        counts: Measurement counts from the circuit execution
        figsize: Figure size as (width, height) in inches
        title: Title for the plot
        output_file: If provided, save the figure to this file
        
    Returns:
        None: Displays or saves the histogram
    """
    # Create the plot
    fig, ax = plt.subplots(figsize=figsize)
    
    # Plot using Qiskit's plot_histogram for better styling
    plot_histogram(counts, ax=ax)
    
    # Enhance the plot
    ax.set_title(title or "Measurement Results")
    ax.set_xlabel("Measured State")
    ax.set_ylabel("Counts")
    
    # Add a grid for better readability
    ax.grid(alpha=0.3)
    
    # Add percentage annotations
    total = sum(counts.values())
    for i, (state, count) in enumerate(counts.items()):
        percentage = 100 * count / total
        ax.annotate(
            f"{percentage:.1f}%", 
            xy=(i, count), 
            xytext=(0, 5),
            textcoords="offset points",
            ha='center', 
            va='bottom'
        )
    
    if output_file:
        plt.savefig(output_file, bbox_inches='tight')
        print(f"Results histogram saved to {output_file}")
    else:
        plt.tight_layout()
        plt.show()


def create_circuit_animation(
    circuit: QuantumCircuit,
    output_file: str,
    dpi: int = 100
) -> None:
    """
    Create an animation showing the step-by-step execution of a quantum circuit.
    
    This is a placeholder function that would require additional dependencies
    like matplotlib's animation module for full implementation.
    
    Args:
        circuit: The quantum circuit to animate
        output_file: File to save the animation to (e.g., 'animation.gif')
        dpi: Resolution of the output animation
        
    Returns:
        None: Saves the animation to the specified file
    """
    # This is a placeholder - in a real implementation, you would:
    # 1. Break down the circuit into steps
    # 2. Create frames for each step
    # 3. Use matplotlib.animation to create an animation
    # 4. Save to output_file
    
    print("Circuit animation functionality not yet implemented")
    print(f"Would create animation of circuit '{circuit.name}' and save to '{output_file}'")
