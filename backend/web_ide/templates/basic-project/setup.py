from setuptools import setup, find_packages

setup(
    name="basic-project",
    version="0.1.0",
    packages=find_packages(),
    install_requires=[
        "numpy>=1.20.0",
        "matplotlib>=3.5.0",
        "pandas>=1.3.0",
        "pytest>=7.0.0",
    ],
    author="Quantum Hub User",
    author_email="user@example.com",
    description="A basic project template created with Quantum Hub",
    keywords="python, data-analysis, visualization",
    python_requires=">=3.8",
)
