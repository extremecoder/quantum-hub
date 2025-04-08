"""
Tests for utility functions.

This module contains unit tests for the utility module functions.
"""

import pytest
import numpy as np
import pandas as pd
import os
import tempfile
from src.utils import load_data, save_data, preprocess_data, generate_sample_data


def test_preprocess_data_normalization():
    """Test that preprocess_data correctly normalizes data"""
    # Create test data
    data = np.array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
    
    # Preprocess the data
    preprocessed = preprocess_data(data)
    
    # Check normalization (should be in range [0, 1])
    assert np.min(preprocessed) == 0
    assert np.max(preprocessed) == 1
    
    # Check that the relative ordering is preserved
    for i in range(len(data) - 1):
        assert preprocessed[i] < preprocessed[i + 1]


def test_preprocess_data_with_outliers():
    """Test that preprocess_data correctly handles outliers"""
    # Create data with outliers
    data = np.array([1, 2, 3, 4, 5, 100, 200])  # 100 and 200 are outliers
    
    # Preprocess the data
    preprocessed = preprocess_data(data)
    
    # The outliers should be removed, so the max normalized value
    # should correspond to 5, not 200
    assert np.max(preprocessed) == 1.0
    
    # Convert the preprocessed data back to original scale to check
    # Check using approximately equal due to floating point precision
    assert len(preprocessed) < len(data)  # Some data points should be removed


def test_preprocess_data_with_constant_data():
    """Test preprocess_data with constant data"""
    # Create constant data
    data = np.array([5, 5, 5, 5, 5])
    
    # Preprocess the data
    preprocessed = preprocess_data(data)
    
    # All values should be 0 (or all the same value)
    assert np.all(preprocessed == preprocessed[0])
    assert preprocessed[0] == 0.0


def test_save_and_load_numpy_array():
    """Test saving and loading a numpy array"""
    # Create test data
    data = np.array([1, 2, 3, 4, 5])
    
    # Create a temporary file path
    with tempfile.NamedTemporaryFile(suffix='.npy', delete=False) as temp_file:
        temp_path = temp_file.name
    
    try:
        # Save the data
        save_data(data, temp_path)
        
        # Load the data
        loaded_data = load_data(temp_path)
        
        # Check equality
        np.testing.assert_array_equal(data, loaded_data)
    finally:
        # Clean up
        if os.path.exists(temp_path):
            os.remove(temp_path)


def test_save_and_load_dataframe():
    """Test saving and loading a pandas DataFrame"""
    # Create test data
    df = pd.DataFrame({
        'A': [1, 2, 3, 4],
        'B': ['a', 'b', 'c', 'd']
    })
    
    # Create a temporary file path
    with tempfile.NamedTemporaryFile(suffix='.csv', delete=False) as temp_file:
        temp_path = temp_file.name
    
    try:
        # Save the data
        save_data(df, temp_path)
        
        # Load the data
        loaded_df = load_data(temp_path)
        
        # Check equality
        pd.testing.assert_frame_equal(df, loaded_df)
    finally:
        # Clean up
        if os.path.exists(temp_path):
            os.remove(temp_path)


def test_generate_sample_data_normal():
    """Test generating normal distribution data"""
    # Generate data
    data = generate_sample_data(size=1000, distribution='normal', 
                                params={'mean': 5, 'std': 2})
    
    # Check properties
    assert len(data) == 1000
    assert abs(np.mean(data) - 5) < 0.5
    assert abs(np.std(data) - 2) < 0.5


def test_generate_sample_data_uniform():
    """Test generating uniform distribution data"""
    # Generate data
    data = generate_sample_data(size=1000, distribution='uniform', 
                                params={'low': 1, 'high': 10})
    
    # Check properties
    assert len(data) == 1000
    assert np.min(data) >= 1
    assert np.max(data) <= 10
    # For uniform distribution, mean should be approximately (high+low)/2
    assert abs(np.mean(data) - 5.5) < 0.5


def test_generate_sample_data_invalid_distribution():
    """Test generating data with invalid distribution"""
    # Try to generate data with invalid distribution
    with pytest.raises(ValueError) as excinfo:
        generate_sample_data(distribution='invalid')
    
    # Check error message
    assert "Unsupported distribution" in str(excinfo.value)


def test_load_data_file_not_found():
    """Test load_data with non-existent file"""
    # Try to load a non-existent file
    with pytest.raises(FileNotFoundError):
        load_data('non_existent_file.csv')


def test_load_data_unsupported_format():
    """Test load_data with unsupported file format"""
    # Create a temporary file with unsupported extension
    with tempfile.NamedTemporaryFile(suffix='.unknown', delete=False) as temp_file:
        temp_path = temp_file.name
    
    try:
        # Try to load the file
        with pytest.raises(ValueError) as excinfo:
            load_data(temp_path)
        
        # Check error message
        assert "Unsupported file format" in str(excinfo.value)
    finally:
        # Clean up
        if os.path.exists(temp_path):
            os.remove(temp_path)
