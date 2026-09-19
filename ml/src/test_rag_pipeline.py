"""
End-to-End Test Suite: MAINTIX RAG, Ollama LLM, & Problem Extractor
===================================================================
Tests:
1. Hybrid Vector + Knowledge Graph RAG retrieval
2. Ollama Local LLM generation / fallback engine
3. Problem Extraction across multiple fault scenarios
4. Product action generation (CMMS Work Order, Part Reservation, Machine Throttle)
"""

import json
import unittest
from ml.rag_engine import rag_service
from ml.src.ai_gateway.gateway import AIGateway
from ml.src.ai_gateway.ollama_client import OllamaClient
from ml.src.rag.problem_extractor import ProblemExtractor


class TestRagAndProblemExtraction(unittest.TestCase):

    def setUp(self):
        self.rag = rag_service
        self.gateway = AIGateway()
        self.extractor = ProblemExtractor()

    def test_ollama_client_health_or_fallback(self):
        """Test Ollama client health check."""
        ollama = OllamaClient()
        is_healthy = ollama.check_health()
        print(f"\n[TEST] Ollama Health: {is_healthy}, Active Model: {ollama.model}")
        self.assertIsInstance(is_healthy, bool)

    def test_bearing_problem_extraction(self):
        """Test extraction for bearing wear query."""
        query = "Loom TX-1250-A left bearing vibrating excessively at 12.4 mm/s RMS with metallic grinding noise"
        problem = self.extractor.extract_problem(
            query_text=query,
            machine_code="TX-1250-A",
            live_telemetry={"vib_rms": 12.4, "temp_bearing": 64.0, "status": "CRITICAL"}
        )

        self.assertEqual(problem["machine_code"], "TX-1250-A")
        self.assertEqual(problem["fault_type"], "BEARING_WEAR")
        self.assertEqual(problem["severity"], "CRITICAL")
        self.assertEqual(problem["iso_zone"], "ZONE_D")
        self.assertEqual(problem["required_spare_part"]["part_number"], "SP-BRG-6208-SKF")
        self.assertTrue(len(problem["symptoms"]) >= 2)
        self.assertEqual(problem["work_order_draft"]["priority"], "URGENT")
        self.assertEqual(len(problem["product_actions"]), 3)
        print(f"\n[TEST] Extracted Bearing Problem: {problem['subsystem']}, Part: {problem['required_spare_part']['name']}")

    def test_motor_thermal_problem_extraction(self):
        """Test extraction for motor overheating query."""
        query = "Machine TX-1250-B motor is overheating with temperature rising to 78°C and cooling fan failure"
        problem = self.extractor.extract_problem(
            query_text=query,
            machine_code="TX-1250-B",
            live_telemetry={"vib_rms": 1.4, "temp_motor": 78.0, "temp_bearing": 45.0, "status": "WARNING"}
        )

        self.assertEqual(problem["machine_code"], "TX-1250-B")
        self.assertEqual(problem["fault_type"], "MOTOR_OVERHEATING")
        self.assertIn("SP-MTR-FAN-24V", problem["required_spare_part"]["part_number"])
        print(f"\n[TEST] Extracted Motor Problem: {problem['subsystem']}, Urgency: {problem['urgency']}")

    def test_rag_query_end_to_end(self):
        """Test full RAG query through ProductionRAGService."""
        query = "What is the procedure when vibration exceeds 4.5 mm/s on TX-1250-A?"
        res = self.rag.query(
            query_text=query,
            role="TECHNICIAN",
            machine_code="TX-1250-A",
            live_telemetry={"vib_rms": 11.2, "temp_bearing": 62.5, "rul_days": 18, "status": "CRITICAL"}
        )

        self.assertIn("answer", res)
        self.assertIn("extracted_problem", res)
        self.assertIn("product_actions", res)
        self.assertGreater(len(res["sources"]), 0)
        self.assertEqual(res["extracted_problem"]["machine_code"], "TX-1250-A")
        print(f"\n[TEST] Full RAG Engine: {res['active_ai_engine']}, Confidence: {res['confidence']}")


if __name__ == "__main__":
    unittest.main()
