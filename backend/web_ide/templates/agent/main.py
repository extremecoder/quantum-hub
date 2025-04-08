"""
Quantum Agent Example
--------------------
This is a sample quantum agent project that demonstrates
a reinforcement learning agent enhanced with quantum computing.
"""

import numpy as np
import random
import matplotlib.pyplot as plt
from qiskit import QuantumCircuit, Aer, execute
from qiskit.visualization import plot_histogram
from qiskit.circuit import Parameter, ParameterVector

class Environment:
    """Simple grid world environment for reinforcement learning."""
    
    def __init__(self, size=4):
        """
        Initialize a grid world environment.
        
        Args:
            size (int): Size of the grid (size x size)
        """
        self.size = size
        self.reset()
        
        # Define rewards
        self.rewards = np.zeros((size, size))
        self.rewards[size-1, size-1] = 1.0  # Goal
        
        # Define terminal states
        self.terminal_states = [(size-1, size-1)]
        
        # Add some obstacles with negative rewards
        self.obstacles = [(1, 1), (2, 1), (1, 2)]
        for obs in self.obstacles:
            self.rewards[obs] = -0.5
    
    def reset(self):
        """Reset the environment to the initial state."""
        self.state = (0, 0)  # Start at top-left
        self.done = False
        return self.state
    
    def step(self, action):
        """
        Take an action and return the next state, reward, and done flag.
        
        Args:
            action (int): 0=up, 1=right, 2=down, 3=left
            
        Returns:
            tuple: (next_state, reward, done)
        """
        if self.done:
            return self.state, 0.0, True
        
        # Current position
        i, j = self.state
        
        # Move according to action
        if action == 0 and i > 0:          # Up
            i -= 1
        elif action == 1 and j < self.size - 1:  # Right
            j += 1
        elif action == 2 and i < self.size - 1:  # Down
            i += 1
        elif action == 3 and j > 0:        # Left
            j -= 1
        
        # Update state
        self.state = (i, j)
        
        # Check if terminal state
        self.done = self.state in self.terminal_states
        
        # Return state, reward, done
        return self.state, self.rewards[self.state], self.done
    
    def render(self):
        """Render the environment."""
        grid = np.zeros((self.size, self.size), dtype=str)
        grid[:] = '.'
        
        # Mark obstacles
        for obs in self.obstacles:
            grid[obs] = 'X'
        
        # Mark goal
        for terminal in self.terminal_states:
            grid[terminal] = 'G'
        
        # Mark agent
        i, j = self.state
        grid[i, j] = 'A'
        
        # Print grid
        print('-' * (self.size * 2 + 1))
        for row in grid:
            print('|', end='')
            for cell in row:
                print(f"{cell}|", end='')
            print()
            print('-' * (self.size * 2 + 1))

class QuantumAgent:
    """Reinforcement learning agent with quantum circuit for action selection."""
    
    def __init__(self, action_space=4, n_qubits=2, learning_rate=0.1, gamma=0.99, epsilon=0.1):
        """
        Initialize a quantum agent for reinforcement learning.
        
        Args:
            action_space (int): Number of possible actions
            n_qubits (int): Number of qubits in the quantum circuit
            learning_rate (float): Learning rate for Q-learning
            gamma (float): Discount factor for future rewards
            epsilon (float): Exploration rate
        """
        self.action_space = action_space
        self.n_qubits = n_qubits
        self.learning_rate = learning_rate
        self.gamma = gamma
        self.epsilon = epsilon
        
        # Initialize Q-table
        self.q_table = {}
        
        # Initialize quantum circuit parameters
        self.theta = np.random.uniform(0, 2*np.pi, 3*n_qubits)
        
        # Create the parametrized quantum circuit
        self.circuit, self.params = self._create_quantum_circuit()
        
        # Quantum simulator
        self.simulator = Aer.get_backend('statevector_simulator')
    
    def _create_quantum_circuit(self):
        """
        Create a parametrized quantum circuit for action selection.
        
        Returns:
            tuple: (circuit, parameters)
        """
        circuit = QuantumCircuit(self.n_qubits)
        params = ParameterVector('θ', 3*self.n_qubits)
        
        param_idx = 0
        # Apply rotation gates with parameters
        for i in range(self.n_qubits):
            circuit.rx(params[param_idx], i)
            param_idx += 1
            circuit.ry(params[param_idx], i)
            param_idx += 1
            circuit.rz(params[param_idx], i)
            param_idx += 1
        
        # Apply entangling gates
        for i in range(self.n_qubits - 1):
            circuit.cx(i, i + 1)
        
        # Measure all qubits
        circuit.measure_all()
        
        return circuit, params
    
    def _state_to_key(self, state):
        """Convert state to hashable key for Q-table."""
        return tuple(state)
    
    def _quantum_action(self, state):
        """
        Use quantum circuit to select an action.
        
        Args:
            state: Environment state
            
        Returns:
            int: Selected action
        """
        # Bind parameters to values depending on state
        state_key = self._state_to_key(state)
        
        # Use current theta parameters
        parameter_values = {param: value for param, value in zip(self.params, self.theta)}
        bound_circuit = self.circuit.bind_parameters(parameter_values)
        
        # Run quantum circuit
        job = execute(bound_circuit, self.simulator, shots=1024)
        result = job.result()
        counts = result.get_counts(bound_circuit)
        
        # Convert measurement outcomes to actions
        action_counts = {i: 0 for i in range(self.action_space)}
        for bitstring, count in counts.items():
            # Map 2-bit string to action (00->0, 01->1, 10->2, 11->3)
            action = int(bitstring, 2) % self.action_space
            action_counts[action] += count
        
        # Choose action with highest count
        max_action = max(action_counts, key=action_counts.get)
        return max_action
    
    def get_action(self, state):
        """
        Select an action using epsilon-greedy policy.
        
        Args:
            state: Environment state
            
        Returns:
            int: Selected action
        """
        # Exploration
        if random.random() < self.epsilon:
            return random.randint(0, self.action_space - 1)
        
        # Exploitation - use quantum circuit
        return self._quantum_action(state)
    
    def update(self, state, action, reward, next_state, done):
        """
        Update the agent's knowledge using Q-learning.
        
        Args:
            state: Current state
            action: Action taken
            reward: Reward received
            next_state: Next state
            done: Whether the episode is done
        """
        state_key = self._state_to_key(state)
        next_state_key = self._state_to_key(next_state)
        
        # Initialize state in Q-table if not exists
        if state_key not in self.q_table:
            self.q_table[state_key] = np.zeros(self.action_space)
        
        if not done:
            if next_state_key not in self.q_table:
                self.q_table[next_state_key] = np.zeros(self.action_space)
            max_next_q = np.max(self.q_table[next_state_key])
            target = reward + self.gamma * max_next_q
        else:
            target = reward
        
        # Update Q-value for current state-action pair
        self.q_table[state_key][action] += self.learning_rate * (target - self.q_table[state_key][action])
        
        # Update quantum circuit parameters based on Q-values
        for i in range(len(self.theta)):
            self.theta[i] += self.learning_rate * np.sin(self.theta[i]) * sum(self.q_table[state_key])

def train_agent(env, agent, episodes=100):
    """
    Train the agent in the environment.
    
    Args:
        env: Environment
        agent: Agent
        episodes: Number of episodes to train
        
    Returns:
        list: Rewards per episode
    """
    rewards_history = []
    
    for episode in range(episodes):
        state = env.reset()
        total_reward = 0
        done = False
        steps = 0
        
        while not done and steps < 100:
            # Select action
            action = agent.get_action(state)
            
            # Take action
            next_state, reward, done = env.step(action)
            
            # Update agent
            agent.update(state, action, reward, next_state, done)
            
            # Update state and rewards
            state = next_state
            total_reward += reward
            steps += 1
        
        rewards_history.append(total_reward)
        
        if episode % 10 == 0 or episode == episodes - 1:
            print(f"Episode {episode+1}/{episodes}, Reward: {total_reward:.2f}, Steps: {steps}")
    
    return rewards_history

def main():
    """Main function to demonstrate a quantum-enhanced reinforcement learning agent."""
    # Create environment and agent
    env = Environment(size=4)
    agent = QuantumAgent(action_space=4, n_qubits=2)
    
    print("Training a Quantum Agent in Grid World Environment")
    print("Goal: Reach the bottom-right corner, avoid obstacles")
    
    # Train the agent
    rewards = train_agent(env, agent, episodes=50)
    
    # Plot the rewards
    plt.figure(figsize=(10, 5))
    plt.plot(rewards)
    plt.title('Rewards per Episode')
    plt.xlabel('Episode')
    plt.ylabel('Total Reward')
    plt.grid(True)
    
    # Test the trained agent
    print("\nTesting trained agent:")
    state = env.reset()
    env.render()
    
    done = False
    steps = 0
    total_reward = 0
    
    while not done and steps < 20:
        action = agent.get_action(state)
        next_state, reward, done = env.step(action)
        
        print(f"\nStep {steps+1}, Action: {['Up', 'Right', 'Down', 'Left'][action]}")
        state = next_state
        total_reward += reward
        steps += 1
        
        env.render()
        
        if done:
            print(f"Goal reached! Total reward: {total_reward:.2f}")
    
    if not done:
        print(f"Goal not reached within step limit. Total reward: {total_reward:.2f}")

if __name__ == "__main__":
    main()
