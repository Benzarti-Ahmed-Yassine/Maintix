"""
MAINTIX Knowledge Graph Builder
===============================
Seeds and constructs the plant-wide Knowledge Graph reflecting industrial factory assets:
- Weaving Looms (TX-1250-A, PCL-GMX-001)
- Components (Bearing-Left, Motor, Planetary Gearbox)
- Sensors (Vibration-03, Bearing Temperature, Phase Current)
- Active & Historical Alarms
- Maintenance Procedures, Spare Parts, Work Orders, and Production Lines
"""

from __future__ import annotations

import logging
from ml.src.graph.knowledge_graph import IndustrialKnowledgeGraph

logger = logging.getLogger("maintix.graph_builder")


def build_default_factory_graph() -> IndustrialKnowledgeGraph:
    """Builds and populates authoritative textile factory Knowledge Graph."""
    kg = IndustrialKnowledgeGraph()

    # 1. Production Lines
    kg.add_entity("Line-04", "ProductionLine", {"name": "Weaving Line 4 Monastir", "target_oee": 85.0})
    kg.add_entity("Line-03", "ProductionLine", {"name": "Weaving Line 3 Monastir", "target_oee": 88.0})

    # 2. Machines
    kg.add_entity("TX-1250-A", "Machine", {"name": "Picanol OptiMax-i 1250 Air-Jet Loom A12", "criticality": "HIGH", "status": "WARNING"})
    kg.add_entity("PCL-GMX-001", "Machine", {"name": "Picanol GamMax Weaving Loom 01", "criticality": "CRITICAL", "status": "CRITICAL"})

    kg.add_relationship("TX-1250-A", "Line-04", "BELONGS_TO")
    kg.add_relationship("PCL-GMX-001", "Line-04", "BELONGS_TO")

    # 3. Components
    kg.add_entity("COMP-BRG-LEFT", "Component", {"name": "Main Shaft Bearing (Left)", "type": "Ball Bearing"})
    kg.add_entity("COMP-MOTOR-01", "Component", {"name": "7.5 kW Main Drive Motor", "type": "AC Induction Servo"})
    kg.add_entity("COMP-GBX-01", "Component", {"name": "Planetary Gearbox Stage 1", "type": "Gearbox"})

    kg.add_relationship("TX-1250-A", "COMP-BRG-LEFT", "HAS_COMPONENT")
    kg.add_relationship("TX-1250-A", "COMP-MOTOR-01", "HAS_COMPONENT")
    kg.add_relationship("PCL-GMX-001", "COMP-BRG-LEFT", "HAS_COMPONENT")
    kg.add_relationship("PCL-GMX-001", "COMP-GBX-01", "HAS_COMPONENT")

    # 4. Sensors
    kg.add_entity("SENS-VIB-03", "Sensor", {"name": "Triaxial Accelerometer (Drive Side)", "unit": "mm/s RMS"})
    kg.add_entity("SENS-TEMP-01", "Sensor", {"name": "PT100 RTD Bearing Thermal Probe", "unit": "°C"})
    kg.add_entity("SENS-CURR-01", "Sensor", {"name": "Hall Effect Current Sensor", "unit": "A"})

    kg.add_relationship("COMP-BRG-LEFT", "SENS-VIB-03", "HAS_SENSOR")
    kg.add_relationship("COMP-BRG-LEFT", "SENS-TEMP-01", "HAS_SENSOR")
    kg.add_relationship("COMP-MOTOR-01", "SENS-CURR-01", "HAS_SENSOR")

    # 5. Faults & Anomalies
    kg.add_entity("ANOM-VIB-SURGE", "Anomaly", {"title": "High Vibration Velocity (11.2 mm/s RMS)", "severity": "CRITICAL"})
    kg.add_entity("FAIL-BRG-WEAR", "Failure", {"title": "Stage 3 Bearing Outer-Race Spalling", "iso_standard": "ISO 10816-3 Zone D"})

    kg.add_relationship("SENS-VIB-03", "ANOM-VIB-SURGE", "INDICATES")
    kg.add_relationship("ANOM-VIB-SURGE", "FAIL-BRG-WEAR", "SUGGESTS")

    # 6. Spare Parts
    kg.add_entity("PART-SKF-6208", "SparePart", {"part_number": "SP-BRG-6208-SKF", "name": "SKF 6208-2RS Ball Bearing", "stock_qty": 14, "location": "Shelf B-12"})
    kg.add_entity("PART-LGMT3-GREASE", "SparePart", {"part_number": "SP-LUB-LGMT3", "name": "SKF LGMT 3 High-Temp Grease (1kg)", "stock_qty": 8, "location": "Chemical Cabinet C-02"})

    # 7. Procedures & Documents
    kg.add_entity("PROC-BRG-REPLACE", "Procedure", {"title": "Loom Main Shaft Bearing Extraction & Replacement Protocol", "standard_hours": 2.0})
    kg.add_entity("DOC-PICANOL-SVC", "Document", {"title": "Picanol OptiMax-i Technical Service Manual", "doc_id": "DOC-PICANOL-1250"})

    kg.add_relationship("FAIL-BRG-WEAR", "PROC-BRG-REPLACE", "REQUIRES")
    kg.add_relationship("PROC-BRG-REPLACE", "PART-SKF-6208", "USES")
    kg.add_relationship("PROC-BRG-REPLACE", "PART-LGMT3-GREASE", "USES")
    kg.add_relationship("TX-1250-A", "DOC-PICANOL-SVC", "HAS_DOCUMENT")

    # 8. Work Orders & Technicians
    kg.add_entity("TECH-KARIM", "Technician", {"name": "Karim Ben Ali", "specialty": "Mechanical Alignment & Vibration Specialist"})
    kg.add_entity("WO-2024-0891", "WorkOrder", {"title": "Urgent Left Bearing Replacement", "status": "OPEN", "priority": "HIGH"})

    kg.add_relationship("WO-2024-0891", "TX-1250-A", "TARGETS")
    kg.add_relationship("WO-2024-0891", "PART-SKF-6208", "USES")
    kg.add_relationship("TECH-KARIM", "WO-2024-0891", "PERFORMED")

    kg.save()
    logger.info("Factory Knowledge Graph built successfully.")
    return kg


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    build_default_factory_graph()
