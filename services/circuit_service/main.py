import os
import uuid
import logging
from typing import List, Dict, Optional, Any
from datetime import datetime

from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Quantum Circuit Service",
    description="Service for managing quantum circuit definitions",
    version="1.0.0",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------- Models -------------------

class CircuitBase(BaseModel):
    name: str
    description: Optional[str] = None
    qubits: int
    gates: List[Dict[str, Any]]
    metadata: Optional[Dict[str, Any]] = Field(default_factory=dict)

class CircuitCreate(CircuitBase):
    user_id: str

class CircuitUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    qubits: Optional[int] = None
    gates: Optional[List[Dict[str, Any]]] = None
    metadata: Optional[Dict[str, Any]] = None

class Circuit(CircuitBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True


# ------------------- Mock Database -------------------
# In production, replace with an actual database

class MockDB:
    def __init__(self):
        self.circuits = {}

    def get_circuit(self, circuit_id: str) -> Optional[Circuit]:
        return self.circuits.get(circuit_id)

    def list_circuits(
        self, 
        user_id: Optional[str] = None, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[Circuit]:
        if user_id:
            filtered = [c for c in self.circuits.values() if c.user_id == user_id]
        else:
            filtered = list(self.circuits.values())
        return filtered[skip:skip+limit]

    def create_circuit(self, circuit: CircuitCreate) -> Circuit:
        circuit_id = str(uuid.uuid4())
        now = datetime.now()
        
        new_circuit = Circuit(
            id=circuit_id,
            user_id=circuit.user_id,
            name=circuit.name,
            description=circuit.description,
            qubits=circuit.qubits,
            gates=circuit.gates,
            metadata=circuit.metadata,
            created_at=now,
            updated_at=now
        )
        
        self.circuits[circuit_id] = new_circuit
        return new_circuit
    
    def update_circuit(self, circuit_id: str, circuit_update: CircuitUpdate) -> Optional[Circuit]:
        existing = self.get_circuit(circuit_id)
        if not existing:
            return None
        
        update_data = circuit_update.dict(exclude_unset=True)
        
        for key, value in update_data.items():
            setattr(existing, key, value)
        
        existing.updated_at = datetime.now()
        self.circuits[circuit_id] = existing
        return existing
    
    def delete_circuit(self, circuit_id: str) -> bool:
        if circuit_id in self.circuits:
            del self.circuits[circuit_id]
            return True
        return False


# Create mock database instance
db = MockDB()

# Add some sample data
sample_circuits = [
    CircuitCreate(
        user_id="user123",
        name="Bell State",
        description="A simple Bell state circuit",
        qubits=2,
        gates=[
            {"type": "h", "target": 0},
            {"type": "cx", "control": 0, "target": 1}
        ]
    ),
    CircuitCreate(
        user_id="user123",
        name="Quantum Fourier Transform",
        description="4-qubit QFT implementation",
        qubits=4,
        gates=[
            {"type": "h", "target": 0},
            {"type": "cp", "control": 0, "target": 1, "angle": "pi/2"},
            {"type": "h", "target": 1},
            {"type": "cp", "control": 0, "target": 2, "angle": "pi/4"},
            {"type": "cp", "control": 1, "target": 2, "angle": "pi/2"},
            {"type": "h", "target": 2},
            {"type": "cp", "control": 0, "target": 3, "angle": "pi/8"},
            {"type": "cp", "control": 1, "target": 3, "angle": "pi/4"},
            {"type": "cp", "control": 2, "target": 3, "angle": "pi/2"},
            {"type": "h", "target": 3},
            {"type": "swap", "qubit1": 0, "qubit2": 3},
            {"type": "swap", "qubit1": 1, "qubit2": 2}
        ]
    ),
    CircuitCreate(
        user_id="user456",
        name="Grover's Algorithm",
        description="Grover's search for 2 qubits",
        qubits=2,
        gates=[
            {"type": "h", "target": 0},
            {"type": "h", "target": 1},
            {"type": "x", "target": 0},
            {"type": "x", "target": 1},
            {"type": "h", "target": 1},
            {"type": "cx", "control": 0, "target": 1},
            {"type": "h", "target": 1},
            {"type": "x", "target": 0},
            {"type": "x", "target": 1},
            {"type": "h", "target": 0},
            {"type": "h", "target": 1},
            {"type": "x", "target": 0},
            {"type": "x", "target": 1},
            {"type": "h", "target": 1},
            {"type": "cx", "control": 0, "target": 1},
            {"type": "h", "target": 1},
            {"type": "x", "target": 0},
            {"type": "x", "target": 1},
            {"type": "h", "target": 0},
            {"type": "h", "target": 1}
        ]
    )
]

for circuit in sample_circuits:
    db.create_circuit(circuit)

# ------------------- Endpoints -------------------

@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "circuit-service"}

@app.get("/circuits", response_model=List[Circuit])
def list_circuits(
    user_id: Optional[str] = Query(None, description="Filter by user ID"),
    skip: int = Query(0, ge=0, description="Number of records to skip"),
    limit: int = Query(100, ge=1, le=100, description="Max records to return")
):
    return db.list_circuits(user_id=user_id, skip=skip, limit=limit)

@app.get("/circuits/{circuit_id}", response_model=Circuit)
def get_circuit(circuit_id: str):
    circuit = db.get_circuit(circuit_id)
    if not circuit:
        raise HTTPException(status_code=404, detail="Circuit not found")
    return circuit

@app.post("/circuits", response_model=Circuit, status_code=201)
def create_circuit(circuit: CircuitCreate):
    try:
        return db.create_circuit(circuit)
    except Exception as e:
        logger.error(f"Error creating circuit: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create circuit")

@app.put("/circuits/{circuit_id}", response_model=Circuit)
def update_circuit(circuit_id: str, circuit_update: CircuitUpdate):
    updated = db.update_circuit(circuit_id, circuit_update)
    if not updated:
        raise HTTPException(status_code=404, detail="Circuit not found")
    return updated

@app.delete("/circuits/{circuit_id}", status_code=204)
def delete_circuit(circuit_id: str):
    if not db.delete_circuit(circuit_id):
        raise HTTPException(status_code=404, detail="Circuit not found")

# ------------------- Open QASM Conversion -------------------

@app.get("/circuits/{circuit_id}/qasm")
def get_circuit_qasm(circuit_id: str):
    circuit = db.get_circuit(circuit_id)
    if not circuit:
        raise HTTPException(status_code=404, detail="Circuit not found")
    
    # Basic OpenQASM 2.0 conversion - in a real system this would be more robust
    qasm_lines = [
        "OPENQASM 2.0;",
        'include "qelib1.inc";',
        f"qreg q[{circuit.qubits}];",
        f"creg c[{circuit.qubits}];"
    ]
    
    # Convert gates to QASM
    for gate in circuit.gates:
        gate_type = gate["type"]
        
        if gate_type == "h":
            qasm_lines.append(f"h q[{gate['target']}];")
        elif gate_type == "x":
            qasm_lines.append(f"x q[{gate['target']}];")
        elif gate_type == "cx" or gate_type == "cnot":
            qasm_lines.append(f"cx q[{gate['control']}],q[{gate['target']}];")
        elif gate_type == "cp":
            angle = gate["angle"]
            if angle == "pi/2":
                qasm_lines.append(f"cp(pi/2) q[{gate['control']}],q[{gate['target']}];")
            elif angle == "pi/4":
                qasm_lines.append(f"cp(pi/4) q[{gate['control']}],q[{gate['target']}];")
            elif angle == "pi/8":
                qasm_lines.append(f"cp(pi/8) q[{gate['control']}],q[{gate['target']}];")
            else:
                qasm_lines.append(f"cp({angle}) q[{gate['control']}],q[{gate['target']}];")
        elif gate_type == "swap":
            qasm_lines.append(f"swap q[{gate['qubit1']}],q[{gate['qubit2']}];")
    
    # Add measurement
    for i in range(circuit.qubits):
        qasm_lines.append(f"measure q[{i}] -> c[{i}];")
    
    return {"qasm": "\n".join(qasm_lines)}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True) 