"""
Tests for the main module.

This module contains unit tests for the main module functions.
"""

import pytest
import numpy as np
import matplotlib.pyplot as plt
from src.main import analyze_data, visualize_data, process_dataset
import os
import tempfile
import pandas as pd


def test_analyze_data_with_normal_distribution():
    """Test analyze_data function with normally distributed data"""
    # Create sample data with known statistics
    np.random.seed(42)  # For reproducibility
    data = np.random.normal(loc=5, scale=2, size=1000)
    
    # Get the statistics
    stats = analyze_data(data)
    
    # Check the keys in the result
    assert set(stats.keys()) == {"mean", "median", "std", "min", "max"}
    
    # Check approximate values (allowing for some sampling error)
    assert abs(stats["mean"] - 5) < 0.2
    assert abs(stats["std"] - 2) < 0.2
    assert stats["min"] < 0  # Should be well below the mean
    assert stats["max"] > 10  # Should be well above the mean


def test_analyze_data_with_empty_array():
    """Test analyze_data function with an empty array"""
    # Test with empty array
    empty_data = np.array([])
    stats = analyze_data(empty_data)
    
    # All statistics should be zero for empty data
    assert stats["mean"] == 0.0
    assert stats["median"] == 0.0
    assert stats["std"] == 0.0
    assert stats["min"] == 0.0
    assert stats["max"] == 0.0


def test_analyze_data_with_single_value():
    """Test analyze_data function with a single value"""
    # Test with single value
    single_data = np.array([5.0])
    stats = analyze_data(single_data)
    
    # Check the statistics for a single value
    assert stats["mean"] == 5.0
    assert stats["median"] == 5.0
    assert stats["std"] == 0.0
    assert stats["min"] == 5.0
    assert stats["max"] == 5.0


def test_visualize_data_returns_figure():
    """Test visualize_data function returns a matplotlib figure"""
    # Create sample data
    data = np.random.normal(loc=0, scale=1, size=50)
    
    # Call the function
    fig = visualize_data(data, "Test Figure")
    
    # Check the return type
    assert isinstance(fig, plt.Figure)
    
    # Check that the figure has the expected number of subplots
    assert len(fig.axes) == 4  # Should have 4 subplots


def test_visualize_data_with_custom_title():
    """Test visualize_data function with a custom title"""
    # Create sample data
    data = np.random.normal(loc=0, scale=1, size=50)
    
    # Call the function with a custom title
    fig = visualize_data(data, "Custom Title")
    
    # Check that the title is correctly set
    assert fig._suptitle.get_text() == "Custom Title"


def test_process_dataset_with_numpy_array():
    """Test process_dataset function with a NumPy array file"""
    # Create a temporary file with numpy array data
    with tempfile.NamedTemporaryFile(suffix='.npy', delete=False) as temp_file:
        temp_path = temp_file.name
        # Create and save sample data
        data = np.random.normal(loc=3, scale=1.5, size=100)
        np.save(temp_path, data)
    
    try:
        # Process the dataset
        stats, fig = process_dataset(temp_path)
        
        # Check the return types
        assert isinstance(stats, dict)
        assert isinstance(fig, plt.Figure)
        
        # Check that the stats are reasonable
        assert abs(stats["mean"] - 3) < 0.5
        assert abs(stats["std"] - 1.5) < 0.5
    finally:
        # Clean up
        if os.path.exists(temp_path):
            os.remove(temp_path)


def test_process_dataset_with_csv_and_column():
    """Test process_dataset function with a CSV file and specific column"""
    # Create a temporary CSV file
    with tempfile.NamedTemporaryFile(suffix='.csv', delete=False) as temp_file:
        temp_path = temp_file.name
        # Create a DataFrame with two columns
        df = pd.DataFrame({
            'A': np.random.normal(loc=5, scale=2, size=100),
            'B': np.random.normal(loc=-3, scale=1, size=100)
        })
        df.to_csv(temp_path, index=False)
    
    try:
        # Process column 'A'
        stats_a, fig_a = process_dataset(temp_path, 'A')
        
        # Process column 'B'
        stats_b, fig_b = process_dataset(temp_path, 'B')
        
        # Check the statistics for each column
        assert abs(stats_a["mean"] - 5) < 1.0
        assert abs(stats_b["mean"] + 3) < 1.0  # mean of B should be around -3
    finally:
        # Clean up
        if os.path.exists(temp_path):
            os.remove(temp_path)


def test_process_dataset_with_invalid_column():
    """Test process_dataset function with an invalid column name"""
    # Create a temporary CSV file
    with tempfile.NamedTemporaryFile(suffix='.csv', delete=False) as temp_file:
        temp_path = temp_file.name
        # Create a simple DataFrame
        df = pd.DataFrame({'A': [1, 2, 3, 4, 5]})
        df.to_csv(temp_path, index=False)
    
    try:
        # Try to process with a non-existent column
        with pytest.raises(ValueError) as excinfo:
            process_dataset(temp_path, 'NonExistent')
        
        # Check the error message
        assert "Column 'NonExistent' not found in data" in str(excinfo.value)
    finally:
        # Clean up
        if os.path.exists(temp_path):
            os.remove(temp_path)
