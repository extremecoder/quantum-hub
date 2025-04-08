"""
Main module for data processing functions.

This module contains the core functionality for the project,
demonstrating basic data processing and visualization.
"""

import numpy as np
import matplotlib.pyplot as plt
from typing import List, Dict, Any, Tuple, Optional, Union
import pandas as pd
from .utils import load_data, save_data


def analyze_data(data: np.ndarray) -> Dict[str, float]:
    """
    Analyze the input data and return basic statistics.
    
    Args:
        data: Input data array
        
    Returns:
        Dictionary containing statistics of the data
    """
    if data.size == 0:
        return {
            "mean": 0.0,
            "median": 0.0,
            "std": 0.0,
            "min": 0.0,
            "max": 0.0
        }
    
    return {
        "mean": float(np.mean(data)),
        "median": float(np.median(data)),
        "std": float(np.std(data)),
        "min": float(np.min(data)),
        "max": float(np.max(data))
    }


def visualize_data(data: np.ndarray, title: str = "Data Visualization") -> plt.Figure:
    """
    Create a visualization of the input data.
    
    Args:
        data: Input data array
        title: Plot title
        
    Returns:
        Matplotlib figure object
    """
    fig, axes = plt.subplots(2, 2, figsize=(12, 8))
    
    # Histogram in the top-left
    axes[0, 0].hist(data, bins=20, alpha=0.7, color='blue')
    axes[0, 0].set_title('Histogram')
    axes[0, 0].set_xlabel('Value')
    axes[0, 0].set_ylabel('Frequency')
    
    # Box plot in the top-right
    axes[0, 1].boxplot(data)
    axes[0, 1].set_title('Box Plot')
    
    # Line plot in the bottom-left
    axes[1, 0].plot(data, marker='o', linestyle='-', alpha=0.7)
    axes[1, 0].set_title('Line Plot')
    axes[1, 0].set_xlabel('Index')
    axes[1, 0].set_ylabel('Value')
    
    # Scatter plot in the bottom-right
    axes[1, 1].scatter(range(len(data)), data, alpha=0.7, color='green')
    axes[1, 1].set_title('Scatter Plot')
    axes[1, 1].set_xlabel('Index')
    axes[1, 1].set_ylabel('Value')
    
    # Set the main title
    fig.suptitle(title, fontsize=16)
    
    # Adjust layout
    fig.tight_layout(rect=[0, 0, 1, 0.95])
    
    return fig


def process_dataset(
    file_path: str, 
    column: Optional[str] = None
) -> Tuple[Dict[str, float], plt.Figure]:
    """
    Process a dataset from a file and return analysis results.
    
    Args:
        file_path: Path to the data file
        column: Column name to analyze (if using CSV/dataframe)
        
    Returns:
        Tuple containing statistics dictionary and figure object
    """
    # Load the data
    data = load_data(file_path)
    
    # Extract column if specified and data is a DataFrame
    if column is not None and isinstance(data, pd.DataFrame):
        if column in data.columns:
            data = data[column].values
        else:
            raise ValueError(f"Column '{column}' not found in data")
    
    # Convert to numpy array if needed
    if not isinstance(data, np.ndarray):
        data = np.array(data)
    
    # Analyze the data
    stats = analyze_data(data)
    
    # Create visualization
    title = f"Analysis of {column if column else 'data'}"
    fig = visualize_data(data, title)
    
    return stats, fig


if __name__ == "__main__":
    # Example usage
    # Generate random data
    sample_data = np.random.normal(loc=0, scale=1, size=100)
    
    # Analyze and visualize
    statistics = analyze_data(sample_data)
    figure = visualize_data(sample_data, "Sample Data Analysis")
    
    # Print statistics
    print("Data Statistics:")
    for key, value in statistics.items():
        print(f"  {key}: {value}")
    
    # Show the figure
    plt.show()
