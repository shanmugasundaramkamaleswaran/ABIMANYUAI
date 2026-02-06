"""
RAG (Retrieval Augmented Generation) Pipeline
PDF → Chunking → Embedding → Vector Store → Query Matching → LLM
Prevents memory crashes by loading only relevant chunks instead of entire PDFs
"""

import os
import pickle
import glob
from typing import List, Optional
import pdfplumber
from pathlib import Path
from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
import faiss
import numpy as np

class RAGPipeline:
    def __init__(self, data_dir: str = "data", model_name: str = "all-MiniLM-L6-v2"):
        """
        Initialize RAG Pipeline
        
        Args:
            data_dir: Directory containing PDFs
            model_name: Sentence transformer model for embeddings
        """
        self.data_dir = data_dir
        self.model_name = model_name
        self.embedder = SentenceTransformer(model_name)
        self.vector_store = None
        self.chunks = []
        self.index_path = os.path.join(data_dir, "vector_index.faiss")
        self.chunks_path = os.path.join(data_dir, "chunks.pkl")
        
        # Load existing index if available
        self._load_index()

    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """Extract text from PDF file"""
        text = ""
        try:
            with pdfplumber.open(pdf_path) as pdf:
                for page in pdf.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
        except Exception as e:
            print(f"Error extracting PDF {pdf_path}: {e}")
        return text

    def chunk_text(self, text: str, chunk_size: int = 500, overlap: int = 100) -> List[str]:
        """
        Split text into chunks with overlap
        
        Args:
            text: Text to chunk
            chunk_size: Size of each chunk (characters)
            overlap: Overlap between chunks
            
        Returns:
            List of text chunks
        """
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=chunk_size,
            chunk_overlap=overlap,
            separators=["\n\n", "\n", ". ", " ", ""]
        )
        return splitter.split_text(text)

    def build_index(self) -> bool:
        """
        Build vector index from all PDFs in data directory
        
        Returns:
            True if successful, False otherwise
        """
        try:
            pdf_files = glob.glob(os.path.join(self.data_dir, "docs", "*.pdf"))
            if not pdf_files:
                print("No PDF files found in data/docs/")
                return False
            
            all_chunks = []
            
            # Extract and chunk all PDFs
            for pdf_path in pdf_files:
                print(f"Processing: {pdf_path}")
                text = self.extract_text_from_pdf(pdf_path)
                chunks = self.chunk_text(text)
                all_chunks.extend(chunks)
                print(f"  → Extracted {len(chunks)} chunks")
            
            if not all_chunks:
                print("No chunks generated from PDFs")
                return False
            
            self.chunks = all_chunks
            
            # Generate embeddings
            print(f"Generating embeddings for {len(all_chunks)} chunks...")
            embeddings = self.embedder.encode(all_chunks, convert_to_numpy=True)
            
            # Create FAISS index
            dimension = embeddings.shape[1]
            self.vector_store = faiss.IndexFlatL2(dimension)
            self.vector_store.add(embeddings.astype(np.float32))
            
            # Save index and chunks
            os.makedirs(self.data_dir, exist_ok=True)
            faiss.write_index(self.vector_store, self.index_path)
            
            with open(self.chunks_path, "wb") as f:
                pickle.dump(self.chunks, f)
            
            print(f"✅ Index built successfully! Total chunks: {len(all_chunks)}")
            return True
            
        except Exception as e:
            print(f"Error building index: {e}")
            return False

    def _load_index(self) -> bool:
        """Load existing vector index from disk"""
        try:
            if os.path.exists(self.index_path) and os.path.exists(self.chunks_path):
                self.vector_store = faiss.read_index(self.index_path)
                with open(self.chunks_path, "rb") as f:
                    self.chunks = pickle.load(f)
                print(f"✅ Loaded existing index with {len(self.chunks)} chunks")
                return True
        except Exception as e:
            print(f"Could not load index: {e}")
        return False

    def retrieve_relevant_chunks(self, query: str, k: int = 3) -> List[str]:
        """
        Retrieve top k most relevant chunks for a query
        
        Args:
            query: User query
            k: Number of chunks to retrieve
            
        Returns:
            List of relevant text chunks
        """
        if self.vector_store is None or not self.chunks:
            return []
        
        try:
            # Encode query
            query_embedding = self.embedder.encode([query], convert_to_numpy=True)
            
            # Search in vector store
            distances, indices = self.vector_store.search(
                query_embedding.astype(np.float32), 
                min(k, len(self.chunks))
            )
            
            # Get relevant chunks
            relevant_chunks = [self.chunks[idx] for idx in indices[0]]
            return relevant_chunks
            
        except Exception as e:
            print(f"Error retrieving chunks: {e}")
            return []

    def get_context_for_query(self, query: str, k: int = 3, max_chars: int = 2000) -> str:
        """
        Get formatted context from relevant chunks for LLM
        
        Args:
            query: User query
            k: Number of chunks to retrieve
            max_chars: Maximum total characters in context
            
        Returns:
            Formatted context string for LLM
        """
        chunks = self.retrieve_relevant_chunks(query, k)
        
        if not chunks:
            return ""
        
        context = "📚 **Relevant Knowledge from Texts:**\n\n"
        total_chars = 0
        
        for i, chunk in enumerate(chunks, 1):
            if total_chars + len(chunk) > max_chars:
                break
            context += f"{i}. {chunk.strip()}\n\n"
            total_chars += len(chunk)
        
        return context

    def clear_index(self):
        """Clear vector index"""
        self.vector_store = None
        self.chunks = []
        if os.path.exists(self.index_path):
            os.remove(self.index_path)
        if os.path.exists(self.chunks_path):
            os.remove(self.chunks_path)
        print("✅ Index cleared")


# Global RAG instance
_rag_instance = None

def get_rag_pipeline() -> RAGPipeline:
    """Get or create global RAG pipeline instance"""
    global _rag_instance
    if _rag_instance is None:
        _rag_instance = RAGPipeline(data_dir="data")
    return _rag_instance

def initialize_rag_index():
    """Initialize RAG index on startup"""
    rag = get_rag_pipeline()
    if not rag.vector_store:
        print("Building RAG index from PDFs...")
        rag.build_index()
    else:
        print(f"RAG pipeline ready with {len(rag.chunks)} chunks")
