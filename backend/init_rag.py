#!/usr/bin/env python3
"""
Initialize RAG index from PDFs
Run this once to build the vector index, then the backend will use it
"""

import sys
import os
sys.path.insert(0, os.path.dirname(__file__))

from utils.rag_pipeline import get_rag_pipeline

if __name__ == "__main__":
    print("🔄 Initializing RAG Pipeline...")
    rag = get_rag_pipeline()
    
    if rag.vector_store and rag.chunks:
        print(f"✅ RAG already initialized with {len(rag.chunks)} chunks")
    else:
        print("📚 Building RAG index from PDFs...")
        success = rag.build_index()
        if success:
            print(f"✅ RAG Pipeline initialized successfully!")
            print(f"   - Chunks: {len(rag.chunks)}")
            print(f"   - Model: {rag.model_name}")
            print(f"   - Index saved to: data/vector_index.faiss")
        else:
            print("❌ Failed to build RAG index")
            print("   Make sure PDFs are in: backend/data/docs/")
            sys.exit(1)
