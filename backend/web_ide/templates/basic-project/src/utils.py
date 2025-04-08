"""
Utility functions for data handling.

This module contains utility functions for loading, saving,
and transforming data used in the project.
"""

import os
import numpy as np
import pandas as pd
from typing import Any, Union, Dict, List


def load_data(file_path: str) -> Union[np.ndarray, pd.DataFrame]:
    """
    Load data from a file.
    
    Supports various file formats including CSV, Excel, JSON, and NumPy arrays.
    
    Args:
        file_path: Path to the data file
        
    Returns:
        Data as numpy array or pandas DataFrame
    """
    # Check if file exists
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"File not found: {file_path}")
    
    # Get file extension
    _, ext = os.path.splitext(file_path)
    ext = ext.lower()
    
    # Load based on file type
    if ext == '.csv':
        return pd.read_csv(file_path)
    elif ext == '.xlsx' or ext == '.xls':
        return pd.read_excel(file_path)
    elif ext == '.json':
        return pd.read_json(file_path)
    elif ext == '.npy':
        return np.load(file_path)
    elif ext == '.txt':
        try:
            return pd.read_csv(file_path, sep='\t')
        except:
            # Try to load as a plain text file with numbers
            with open(file_path, 'r') as f:
                data = [float(line.strip()) for line in f if line.strip()]
            return np.array(data)
    else:
        raise ValueError(f"Unsupported file format: {ext}")


def save_data(data: Union[np.ndarray, pd.DataFrame], file_path: str) -> None:
    """
    Save data to a file.
    
    Args:
        data: Data to save (numpy array or pandas DataFrame)
        file_path: Path where the file should be saved
        
    Returns:
        None
    """
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(os.path.abspath(file_path)), exist_ok=True)
    
    # Get file extension
    _, ext = os.path.splitext(file_path)
    ext = ext.lower()
    
    # Save based on file type and data type
    if isinstance(data, pd.DataFrame):
        if ext == '.csv':
            data.to_csv(file_path, index=False)
        elif ext == '.xlsx' or ext == '.xls':
            data.to_excel(file_path, index=False)
        elif ext == '.json':
            data.to_json(file_path)
        else:
            raise ValueError(f"Unsupported file format for DataFrame: {ext}")
    elif isinstance(data, np.ndarray):
        if ext == '.npy':
            np.save(file_path, data)
        elif ext == '.csv':
            pd.DataFrame(data).to_csv(file_path, index=False)
        elif ext == '.txt':
            np.savetxt(file_path, data)
        else:
            raise ValueError(f"Unsupported file format for numpy array: {ext}")
    else:
        raise TypeError(f"Unsupported data type: {type(data)}")


def preprocess_data(data: np.ndarray) -> np.ndarray:
    """
    Preprocess the data by removing outliers and normalizing.
    
    Args:
        data: Input data array
        
    Returns:
        Preprocessed data array
    """
    # Remove outliers (values beyond 3 standard deviations)
    mean = np.mean(data)
    std = np.std(data)
    filtered_data = data[(data >= mean - 3 * std) & (data <= mean + 3 * std)]
    
    # If filtering removed all data, return original data
    if filtered_data.size == 0:
        filtered_data = data
    
    # Normalize to [0, 1] range
    if np.max(filtered_data) != np.min(filtered_data):
        normalized_data = (filtered_data - np.min(filtered_data)) / (np.max(filtered_data) - np.min(filtered_data))
    else:
        normalized_data = np.zeros_like(filtered_data)
    
    return normalized_data


def generate_sample_data(
    size: int = 100,
    distribution: str = 'normal',
    params: Dict[str, float] = None
) -> np.ndarray:
    """
    Generate sample data from various distributions.
    
    Args:
        size: Number of data points to generate
        distribution: Distribution type ('normal', 'uniform', 'exponential')
        params: Distribution parameters
        
    Returns:
        Generated data array
    """
    if params is None:
        params = {}
    
    if distribution == 'normal':
        mean = params.get('mean', 0.0)
        std = params.get('std', 1.0)
        return np.random.normal(loc=mean, scale=std, size=size)
    elif distribution == 'uniform':
        low = params.get('low', 0.0)
        high = params.get('high', 1.0)
        return np.random.uniform(low=low, high=high, size=size)
    elif distribution == 'exponential':
        scale = params.get('scale', 1.0)
        return np.random.exponential(scale=scale, size=size)
    else:
        raise ValueError(f"Unsupported distribution: {distribution}")
