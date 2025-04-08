from setuptools import setup, find_packages

setup(
    name="quantum-project",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "qiskit>=0.40.0",
        "matplotlib>=3.5.0",
        "numpy>=1.20.0",
        "pandas>=1.3.0",
    ],
    author="Quantum Hub User",
    author_email="user@example.com",
    description="A quantum computing project created with Quantum Hub",
    keywords="quantum, computing, qiskit",
    python_requires=">=3.8",
)
