"""
Quantum Machine Learning Model Example
-------------------------------------
This is a sample quantum machine learning project that demonstrates
the implementation of a quantum neural network (QNN).
"""

import numpy as np
from qiskit import QuantumCircuit
from qiskit.algorithms.optimizers import COBYLA
from qiskit.circuit import Parameter, ParameterVector
from qiskit.utils import algorithm_globals
from qiskit_machine_learning.neural_networks import SamplerQNN
from qiskit_machine_learning.algorithms import NeuralNetworkClassifier
from qiskit.primitives import Sampler

def create_feature_map(n_qubits, reps=1):
    """
    Creates a feature map circuit that encodes classical data into quantum states.
    
    Args:
        n_qubits (int): Number of qubits
        reps (int): Number of repetitions of the feature map
        
    Returns:
        QuantumCircuit: Feature map circuit
    """
    feature_map = QuantumCircuit(n_qubits)
    params = ParameterVector('x', n_qubits)
    
    for _ in range(reps):
        # Apply rotation gates with classical input data
        for i in range(n_qubits):
            feature_map.h(i)
            feature_map.rz(params[i], i)
    
    return feature_map, params

def create_ansatz(n_qubits, reps=1):
    """
    Creates a variational quantum circuit (ansatz) for the QNN.
    
    Args:
        n_qubits (int): Number of qubits
        reps (int): Number of repetitions of the ansatz layers
        
    Returns:
        QuantumCircuit: Ansatz circuit
    """
    ansatz = QuantumCircuit(n_qubits)
    params = ParameterVector('θ', n_qubits * reps * 3)  # 3 rotation gates per qubit per layer
    
    param_idx = 0
    for r in range(reps):
        # Apply rotation gates with trainable parameters
        for i in range(n_qubits):
            ansatz.rx(params[param_idx], i)
            param_idx += 1
            ansatz.ry(params[param_idx], i)
            param_idx += 1
            ansatz.rz(params[param_idx], i)
            param_idx += 1
        
        # Apply entangling gates if more than one qubit
        if n_qubits > 1:
            for i in range(n_qubits - 1):
                ansatz.cx(i, i + 1)
            ansatz.cx(n_qubits - 1, 0)  # Connect the last qubit to the first
    
    return ansatz, params

def create_qnn(n_qubits, feature_reps=1, ansatz_reps=1):
    """
    Creates a quantum neural network from feature map and ansatz.
    
    Args:
        n_qubits (int): Number of qubits
        feature_reps (int): Number of repetitions for the feature map
        ansatz_reps (int): Number of repetitions for the ansatz
        
    Returns:
        SamplerQNN: Quantum neural network
    """
    feature_map, input_params = create_feature_map(n_qubits, feature_reps)
    ansatz, weight_params = create_ansatz(n_qubits, ansatz_reps)
    
    # Combine feature map and ansatz
    qc = QuantumCircuit(n_qubits)
    qc.compose(feature_map, inplace=True)
    qc.compose(ansatz, inplace=True)
    
    # Measure all qubits
    qc.measure_all()
    
    # Define the readout function (interpret measurement as 0 or 1)
    def parity(bit_string):
        """Calculate the parity of a bit string (0 if even number of 1s, 1 if odd)"""
        return sum(int(bit) for bit in bit_string) % 2
    
    # Create the QNN
    qnn = SamplerQNN(
        circuit=qc,
        input_params=input_params,
        weight_params=weight_params,
        interpret=parity,
        sampler=Sampler()
    )
    
    return qnn

def generate_sample_data(n_samples=20):
    """
    Generates simple toy data for binary classification.
    
    Args:
        n_samples (int): Number of samples to generate
        
    Returns:
        tuple: X_train (features), y_train (labels)
    """
    # Set random seed for reproducibility
    algorithm_globals.random_seed = 42
    np.random.seed(42)
    
    # Generate random 2D data
    X_train = np.random.uniform(0, 2*np.pi, (n_samples, 2))
    
    # Define a simple decision boundary (circle)
    center = np.array([np.pi, np.pi])
    radius = np.pi/2
    
    # Assign labels based on distance from center
    distances = np.linalg.norm(X_train - center, axis=1)
    y_train = (distances < radius).astype(np.int64)
    
    return X_train, y_train

def main():
    """Main function to demonstrate a quantum neural network classifier."""
    # Define model parameters
    n_qubits = 2
    n_samples = 20
    
    print("Creating a Quantum Neural Network classifier model")
    print(f"Using {n_qubits} qubits")
    
    # Generate synthetic data
    X_train, y_train = generate_sample_data(n_samples)
    print(f"Generated {n_samples} training samples")
    
    # Create QNN
    qnn = create_qnn(n_qubits, feature_reps=1, ansatz_reps=2)
    
    # Create QNN classifier
    optimizer = COBYLA(maxiter=100)
    classifier = NeuralNetworkClassifier(
        neural_network=qnn,
        optimizer=optimizer,
        callback=lambda weights, obj_func_eval: print(f"Objective function value: {obj_func_eval}")
    )
    
    print("\nTraining quantum model...")
    # Fit the classifier to the data
    classifier.fit(X_train, y_train)
    
    print("\nTraining complete!")
    print(f"Training accuracy: {classifier.score(X_train, y_train):.4f}")
    
    # Make predictions on a few samples
    n_test = 5
    X_test = X_train[:n_test]
    y_test = y_train[:n_test]
    
    print("\nSample predictions:")
    y_pred = classifier.predict(X_test)
    for i in range(n_test):
        print(f"Sample {i}: True label = {y_test[i]}, Predicted = {y_pred[i]}")

if __name__ == "__main__":
    main()
