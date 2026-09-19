"""
MAINTIX Problem Extractor & Industrial Action Resolver
======================================================
Extracts structured problem definition, root cause, required spare parts,
severity levels, and actionable CMMS/GMAO work order drafts from conversational
user inputs and RAG context.
"""

from __future__ import annotations

import re
from typing import Any, Dict, List, Optional


class ProblemExtractor:
    """Extracts structured machine problems and resolves product actions."""

    FAULT_TAXONOMY = {
        "BEARING_WEAR": {
            "keywords": ["vibration", "bearing", "roulement", "palier", "pitting", "écaillage", "arbre", "shaft", "grinding", "frottement"],
            "component": "Main Shaft Bearing (Left)",
            "part_number": "SP-BRG-6208-SKF",
            "part_name": "SKF 6208-2RS Deep Groove Ball Bearing",
            "lubricant": "SKF LGMT 3 High-Temp Synthetic Grease (15g)",
            "location": "Warehouse Shelf B-12",
            "stock_available": 14,
            "estimated_downtime_hours": 2.0,
            "avoided_loss_usd": 24650.0,
            "action_title": "Remplacement Palier Roulement Arbre Principal",
        },
        "MOTOR_OVERHEATING": {
            "keywords": ["motor", "moteur", "temp", "température", "surchauffe", "overheat", "bobinage", "thermal", "chaud", "fan", "ventilateur"],
            "component": "AC Induction Servo Motor (7.5 kW)",
            "part_number": "SP-MTR-FAN-24V",
            "part_name": "Axial Cooling Fan 24V DC / Thermal Sensor Probe",
            "lubricant": "None (Electrical)",
            "location": "Warehouse Shelf C-04",
            "stock_available": 8,
            "estimated_downtime_hours": 1.5,
            "avoided_loss_usd": 18200.0,
            "action_title": "Maintenance Thermique & Contrôle Ventilation Moteur",
        },
        "OVERCURRENT": {
            "keywords": ["current", "courant", "ampère", "amperage", "overcurrent", "surintensité", "variateur", "inverter", "igbt", "disjoncteur", "trip"],
            "component": "Power Drive Electronics / Inverter Module",
            "part_number": "SP-DRV-IGBT-15KW",
            "part_name": "Siemens 15kW IGBT Inverter Power Module",
            "lubricant": "Thermal Conductive Paste",
            "location": "Warehouse Shelf A-01 (Cleanroom)",
            "stock_available": 3,
            "estimated_downtime_hours": 3.0,
            "avoided_loss_usd": 31500.0,
            "action_title": "Contrôle Variateur & Remplacement Module Puissance",
        },
        "GEARBOX_FAULT": {
            "keywords": ["gearbox", "engrenage", "réducteur", "huile", "oil", "leak", "fuite", "backlash", "jeu", "dent"],
            "component": "Helical Reduction Gearbox (Ratio 4.2:1)",
            "part_number": "SP-GBX-SEAL-42",
            "part_name": "High-Pressure Viton Oil Seal Kit",
            "lubricant": "ISO VG 220 Synthetic Gear Oil (2.5L)",
            "location": "Warehouse Shelf D-08",
            "stock_available": 6,
            "estimated_downtime_hours": 2.5,
            "avoided_loss_usd": 19400.0,
            "action_title": "Vidange Réducteur & Remplacement Joints d'Étanchéité",
        },
        "ALIGNMENT_ISSUE": {
            "keywords": ["alignement", "alignment", "désalignement", "misalignment", "laser", "vibration axiale", "accouplement", "coupling"],
            "component": "Flexible Shaft Coupling & Mounting Flange",
            "part_number": "SP-CPL-FLEX-65",
            "part_name": "Elastomeric Coupling Insert 65mm",
            "lubricant": "None",
            "location": "Warehouse Shelf B-05",
            "stock_available": 11,
            "estimated_downtime_hours": 1.0,
            "avoided_loss_usd": 12500.0,
            "action_title": "Contrôle d'Alignement Laser & Réglage Accouplement",
        }
    }

    def extract_problem(
        self,
        query_text: str,
        machine_code: str = "TX-1250-A",
        live_telemetry: Optional[Dict[str, Any]] = None,
        retrieved_context: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Extracts a structured problem entity from the user query, machine code, and telemetry.
        """
        text_lower = query_text.lower()
        
        # 1. Detect Machine Code override if mentioned in text (e.g. TX-1250-B or Loom 4)
        detected_machine = machine_code
        m_match = re.search(r"\b(TX-1250-[A-Z]|PCL-GMX-\d{3}|LOOM-\d+|LIGNE-\d+)\b", query_text, re.IGNORECASE)
        if m_match:
            detected_machine = m_match.group(1).upper()
        elif "loom 4" in text_lower or "métier 4" in text_lower:
            detected_machine = "TX-1250-A"
        elif "loom 1" in text_lower:
            detected_machine = "TX-1250-B"

        # 2. Telemetry signals
        tel = live_telemetry or {
            "vib_rms": 11.2,
            "vib_peak": 14.8,
            "temp_bearing": 62.5,
            "temp_motor": 48.5,
            "current": 4.8,
            "voltage": 400.0,
            "speed_rpm": 1450.0,
            "rul_days": 18,
            "status": "CRITICAL",
        }

        vib_rms = float(tel.get("vib_rms", 1.4))
        temp_bearing = float(tel.get("temp_bearing", 42.0))
        temp_motor = float(tel.get("temp_motor", 45.0))
        current = float(tel.get("current", 4.2))
        rul_days = int(tel.get("rul_days", 60))

        # 3. Fault Classification & Keyword Scoring
        best_fault_key = "BEARING_WEAR"
        best_score = 0

        # Base scoring from telemetry
        if vib_rms > 4.5:
            best_score += 3
            best_fault_key = "BEARING_WEAR"
        if temp_motor > 65.0:
            if best_score < 3:
                best_score = 3
                best_fault_key = "MOTOR_OVERHEATING"
        if current > 5.5:
            if best_score < 3:
                best_score = 3
                best_fault_key = "OVERCURRENT"

        # Scoring from text keywords
        for fault_key, meta in self.FAULT_TAXONOMY.items():
            score = sum(1 for kw in meta["keywords"] if kw in text_lower)
            if score > best_score:
                best_score = score
                best_fault_key = fault_key

        fault_info = self.FAULT_TAXONOMY[best_fault_key]

        # 4. Severity & ISO Zone
        if vib_rms > 4.5 or temp_bearing > 65.0 or best_score >= 3:
            severity = "CRITICAL"
            iso_zone = "ZONE_D"
            urgency = "Immédiate (< 24 Heures)"
        elif vib_rms > 2.8 or temp_bearing > 55.0:
            severity = "HIGH"
            iso_zone = "ZONE_C"
            urgency = "Sous 48 Heures (Créneau Préventif)"
        elif vib_rms > 1.8:
            severity = "MEDIUM"
            iso_zone = "ZONE_B"
            urgency = "Sous 7 Jours (Planification Standard)"
        else:
            severity = "LOW"
            iso_zone = "ZONE_A"
            urgency = "Surveillance Continue Nominale"

        # 5. Extract Symptoms List
        symptoms = []
        if vib_rms > 4.5:
            symptoms.append(f"Vibration RMS critique ({vib_rms:.1f} mm/s - Dépassement Seuil ISO 10816 Zone D)")
        elif vib_rms > 2.8:
            symptoms.append(f"Vibration RMS élevée ({vib_rms:.1f} mm/s - Zone d'avertissement C)")
        else:
            symptoms.append(f"Vibration nominale ({vib_rms:.1f} mm/s RMS)")

        if temp_bearing > 55.0:
            symptoms.append(f"Échauffement anormal du palier ({temp_bearing:.1f} °C vs nominal 42°C)")
        if temp_motor > 60.0:
            symptoms.append(f"Montée thermique bobinage moteur ({temp_motor:.1f} °C)")
        if current > 5.0:
            symptoms.append(f"Appel de courant supérieur au nominal ({current:.1f} A)")
        if "noise" in text_lower or "bruit" in text_lower or "grinding" in text_lower or "claquement" in text_lower:
            symptoms.append("Bruit anormal signalé par l'opérateur (frottement / claquement mécanique)")

        # 6. CMMS Work Order Draft
        work_order_draft = {
            "title": f"[{severity}] {fault_info['action_title']} - {detected_machine}",
            "machine_code": detected_machine,
            "target_subsystem": fault_info["component"],
            "fault_type": best_fault_key,
            "priority": "URGENT" if severity == "CRITICAL" else "HIGH" if severity == "HIGH" else "MEDIUM",
            "estimated_duration_hours": fault_info["estimated_downtime_hours"],
            "assigned_role": "Senior Mechanical Reliability Technician",
            "required_parts": [
                {
                    "part_number": fault_info["part_number"],
                    "name": fault_info["part_name"],
                    "quantity": 1,
                    "location": fault_info["location"],
                    "in_stock": fault_info["stock_available"],
                }
            ],
            "required_lubricant": fault_info["lubricant"],
            "procedure_steps": [
                f"1. Isoler et consigner électriquement la machine {detected_machine} (LOTO)",
                f"2. Démonter le carter de protection et inspecter le {fault_info['component']}",
                f"3. Remplacer la pièce par {fault_info['part_name']} ({fault_info['part_number']})",
                f"4. Appliquer {fault_info['lubricant']}",
                "5. Contrôler le faux-rond radial au comparateur (Tolérance <= 0.02 mm)",
                "6. Effectuer essai à vide de 15 minutes et valider la vibration < 1.4 mm/s RMS",
            ],
            "safety_instructions": "EPI obligatoires : Gants anti-coupure, lunettes de sécurité, chaussures S3. Consignation LOTO requise.",
        }

        # 7. Recommended Product Actions
        product_actions = [
            {
                "action_id": "CREATE_WORK_ORDER",
                "label": "Créer l'Ordre de Travail GMAO",
                "type": "PRIMARY",
                "payload": work_order_draft,
            },
            {
                "action_id": "RESERVE_SPARE_PART",
                "label": f"Réserver {fault_info['part_name']} ({fault_info['location']})",
                "type": "SECONDARY",
                "payload": {
                    "part_number": fault_info["part_number"],
                    "part_name": fault_info["part_name"],
                    "quantity": 1,
                    "location": fault_info["location"],
                    "stock_left": fault_info["stock_available"] - 1,
                },
            },
            {
                "action_id": "THROTTLE_MACHINE",
                "label": f"Appliquer Consigne Automate (-15% Cadence sur {detected_machine})",
                "type": "WARNING",
                "payload": {
                    "machine_code": detected_machine,
                    "target_speed_rpm": 1250,
                    "reason": f"Protection mécanique {fault_info['component']} avant intervention",
                },
            },
        ]

        return {
            "machine_code": detected_machine,
            "fault_type": best_fault_key,
            "subsystem": fault_info["component"],
            "severity": severity,
            "iso_zone": iso_zone,
            "urgency": urgency,
            "symptoms": symptoms,
            "rul_days": rul_days,
            "confidence": 0.95 if severity == "CRITICAL" else 0.92,
            "required_spare_part": {
                "part_number": fault_info["part_number"],
                "name": fault_info["part_name"],
                "stock_available": fault_info["stock_available"],
                "location": fault_info["location"],
                "lubricant": fault_info["lubricant"],
            },
            "estimated_downtime_hours": fault_info["estimated_downtime_hours"],
            "avoided_loss_usd": fault_info["avoided_loss_usd"],
            "work_order_draft": work_order_draft,
            "product_actions": product_actions,
        }
