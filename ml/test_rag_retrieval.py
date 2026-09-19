"""
MAINTIX RAG Retrieval Test Suite
=================================
Tests that the HybridRAGRetriever returns the correct chunks for known queries.

Run from the project root:
    cd c:/Users/benza/maintix
    python -m ml.test_rag_retrieval
"""

import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ml.src.rag.document_processor import DocumentProcessor
from ml.src.rag.embeddings import DenseEmbedder
from ml.src.rag.vector_store import VectorStore
from ml.src.rag.retriever import HybridRAGRetriever

# --- ANSI colours ------------------------------------------------------------
GREEN  = "\033[92m"
RED    = "\033[91m"
YELLOW = "\033[93m"
CYAN   = "\033[96m"
RESET  = "\033[0m"

def section(title: str):
    print(f"\n{CYAN}{'-'*60}{RESET}")
    print(f"{CYAN}  {title}{RESET}")
    print(f"{CYAN}{'-'*60}{RESET}")


# --- KNOWN GROUND-TRUTH TEST CASES ------------------------------------------
TEST_CASES = [
    {
        "query": "vibration zone D critical threshold shutdown",
        "expected_doc_id": "DOC-ISO-10816",
        "description": "ISO vibration standard -- zone D critical danger",
    },
    {
        "query": "bearing lubrication SKF grease replenishment interval",
        "expected_doc_id": "DOC-SKF-6208",
        "description": "SKF 6208 bearing maintenance manual",
    },
    {
        "query": "Picanol loom vibration temperature throttled mode",
        "expected_doc_id": "DOC-PICANOL-1250",
        "description": "Picanol air-jet loom service manual",
    },
    {
        "query": "RMS mm/s warning zone B unrestricted operation",
        "expected_doc_id": "DOC-ISO-10816",
        "description": "ISO 10816 zone B description",
    },
    {
        "query": "shaft radial runout tolerance 0.02 mm drive",
        "expected_doc_id": "DOC-SKF-6208",
        "description": "SKF bearing shaft tolerance",
    },
]


def build_test_retriever():
    processor = DocumentProcessor()
    embedder  = DenseEmbedder()
    import tempfile, pathlib; _tmp = pathlib.Path(tempfile.mktemp(suffix=".json")); store = VectorStore(persist_path=_tmp)

    corpus = [
        {
            "doc_id": "DOC-ISO-10816",
            "title": "ISO 10816-3 Mechanical Vibration Evaluation Standard",
            "category": "STANDARD",
            "content": (
                "Zone A: Newly commissioned machinery (< 1.4 mm/s RMS). "
                "Zone B: Unrestricted continuous industrial operation (1.4 - 2.8 mm/s RMS). "
                "Zone C: Warning condition (2.8 - 4.5 mm/s RMS). "
                "Zone D: Critical danger threshold (> 4.5 mm/s RMS). "
                "Immediate trip or shutdown mandatory to prevent shaft fracture or bearing seizure."
            ),
        },
        {
            "doc_id": "DOC-SKF-6208",
            "title": "SKF Industrial Deep Groove Ball Bearing 6208 Maintenance Manual",
            "category": "MANUAL",
            "content": (
                "Part Ref: SP-BRG-6208-SKF. Outer Diameter: 80 mm, Bore: 40 mm, Width: 18 mm. "
                "Lubrication: SKF LGMT 3 mineral oil grease. Replenishment: 15g per cavity at 2,000h intervals. "
                "Drive shaft radial runout tolerance must not exceed 0.02 mm."
            ),
        },
        {
            "doc_id": "DOC-PICANOL-1250",
            "title": "Picanol OptiMax-i 1250 Air-Jet Loom Service Manual",
            "category": "MANUAL",
            "content": (
                "Main Drive Motor: 7.5 kW AC Induction Servo. Nominal Weft Rate: 1,250 PPM. "
                "When vibration exceeds 4.5 mm/s RMS or temperature exceeds 60 on Left Main Drive, "
                "the machine control unit enters throttled mode to prevent shedding motion lockup."
            ),
        },
    ]

    for doc in corpus:
        chunks = processor.chunk_document(
            doc_id=doc["doc_id"],
            title=doc["title"],
            content=doc["content"],
            category=doc["category"],
            validation_status="VALIDATED",
        )
        embeddings = embedder.embed_texts([c.text for c in chunks])
        store.add_chunks(chunks, embeddings)

    return HybridRAGRetriever(store, embedder)


def run_retrieval_tests(retriever):
    section("RETRIEVAL CORRECTNESS TESTS")
    passed, failed = 0, 0

    for i, tc in enumerate(TEST_CASES, 1):
        results = retriever.retrieve(tc["query"], top_k=4)
        retrieved_doc_ids = [r["doc_id"] for r in results]
        hit  = tc["expected_doc_id"] in retrieved_doc_ids
        rank = retrieved_doc_ids.index(tc["expected_doc_id"]) + 1 if hit else "NOT FOUND"

        status = f"{GREEN}PASS{RESET}" if hit else f"{RED}FAIL{RESET}"
        print(f"\n[{i}/{len(TEST_CASES)}] [{status}]  {tc['description']}")
        print(f"  Query   : \"{tc['query']}\"")
        print(f"  Expected: {tc['expected_doc_id']}  |  Rank: {rank}")
        for j, r in enumerate(results, 1):
            marker = " <-- EXPECTED" if r["doc_id"] == tc["expected_doc_id"] else ""
            print(f"    [{j}] doc={r['doc_id']}  score={r['score']}  chunk={r['chunk_id']}{marker}")

        passed += hit
        failed += not hit

    return passed, failed


def run_score_analysis(retriever):
    section("SCORE SPREAD ANALYSIS (confidence)")
    queries = [
        "bearing grease lubrication interval",
        "vibration shutdown critical emergency",
        "motor temperature throttle loom",
    ]
    for q in queries:
        results = retriever.retrieve(q, top_k=4)
        print(f"\n  Query: \"{q}\"")
        if len(results) >= 2:
            gap = results[0]["score"] - results[1]["score"]
            confidence = "HIGH" if gap > 0.3 else ("MEDIUM" if gap > 0.1 else "LOW")
            print(f"  Gap: {round(gap,3)}  => {confidence} confidence")
        for r in results:
            print(f"    score={r['score']}  doc={r['doc_id']}")


def run_negative_test(retriever):
    section("NEGATIVE / OUT-OF-DOMAIN QUERIES")
    for q in ["quarterly sales forecast revenue", "employee vacation HR policy"]:
        results = retriever.retrieve(q, top_k=4)
        top_score = results[0]["score"] if results else 0
        verdict = "WARNING: HIGH score (hallucination risk?)" if top_score > 1.0 else "OK: Low score"
        print(f"\n  Query: \"{q}\"  |  Top score: {top_score}  => {verdict}")


def run_category_filter_test(retriever):
    section("CATEGORY FILTER TEST")
    for cat in ["STANDARD", "MANUAL", None]:
        results = retriever.retrieve("vibration", top_k=4, category=cat)
        cats = list({r["category"] for r in results})
        label = cat if cat else "None (no filter)"
        all_match = all(r["category"] == cat for r in results) if cat else True
        status = "OK" if all_match else "FAIL - filter not applied"
        print(f"\n  Filter={label}  =>  returned categories: {cats}  |  {status}")


if __name__ == "__main__":
    print("\n" + "="*60)
    print("  MAINTIX RAG RETRIEVAL TEST SUITE")
    print("="*60)

    print("\nBuilding test retriever...")
    retriever = build_test_retriever()
    print(f"  Chunks indexed: {len(retriever.vector_store.chunks)}")

    passed, failed = run_retrieval_tests(retriever)
    run_score_analysis(retriever)
    run_negative_test(retriever)
    run_category_filter_test(retriever)

    print("\n" + "="*60)
    print("  SUMMARY")
    print("="*60)
    total = passed + failed
    pct = round((passed / total) * 100) if total > 0 else 0
    print(f"  Passed: {passed}/{total} ({pct}%)")
    if failed:
        print(f"  FAILED: {failed} test(s) -- check embeddings and BM25 tokenizer")
    print()
