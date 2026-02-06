"""
RAG (Retrieval Augmented Generation) Pipeline - Lightweight Version
Chunks PDFs → Creates embeddings → Stores in vector DB → Retrieves relevant chunks for LLM
"""

import os
from pathlib import Path
from typing import List
from langchain_community.vectorstores import Chroma
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_core.documents import Document


class SimpleTextSplitter:
    """Simple text splitter without nltk dependency"""
    def __init__(self, chunk_size: int = 500, chunk_overlap: int = 100):
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
    
    def split_text(self, text: str) -> List[str]:
        """Split text into chunks"""
        if not text:
            return []
        
        # Split by paragraphs first
        paragraphs = text.split('\n\n')
        chunks = []
        current_chunk = ""
        
        for para in paragraphs:
            if len(current_chunk) + len(para) < self.chunk_size:
                current_chunk += para + "\n\n"
            else:
                if current_chunk:
                    chunks.append(current_chunk.strip())
                current_chunk = para + "\n\n"
        
        if current_chunk:
            chunks.append(current_chunk.strip())
        
        return chunks
    
    def split_documents(self, documents):
        """Split documents"""
        all_chunks = []
        for doc in documents:
            chunks = self.split_text(doc.page_content)
            for chunk in chunks:
                all_chunks.append(Document(page_content=chunk, metadata=doc.metadata))
        return all_chunks


class RAGPipeline:
    def __init__(self, persist_dir: str = "data/vector_db"):
        """Initialize RAG pipeline with vector database"""
        self.persist_dir = persist_dir
        os.makedirs(persist_dir, exist_ok=True)
        
        # Use lightweight sentence-transformers model
        self.embeddings = HuggingFaceEmbeddings(
            model_name="all-MiniLM-L6-v2",
            model_kwargs={"device": "cpu"}
        )
        
        # Load or create vector store
        self.vectorstore = Chroma(
            persist_directory=persist_dir,
            embedding_function=self.embeddings
        )
        
        self.retriever = self.vectorstore.as_retriever(
            search_kwargs={"k": 3}  # Retrieve top 3 relevant chunks
        )
        
        print("✅ RAG Pipeline initialized")
    
    def chunk_text(self, text: str, chunk_size: int = 500, overlap: int = 100) -> List[str]:
        """Split text into chunks with overlap"""
        splitter = SimpleTextSplitter(chunk_size=chunk_size, chunk_overlap=overlap)
        chunks = splitter.split_text(text)
        return chunks
    
    def load_pdf(self, pdf_path: str) -> None:
        """Load PDF and add to vector store"""
        # PDFs are converted to txt files, so load from txt instead
        txt_path = str(pdf_path).replace('.pdf', '.txt')
        if os.path.exists(txt_path):
            with open(txt_path, 'r', encoding='utf-8') as f:
                self.load_text(f.read(), metadata={"source": Path(txt_path).name})
    
    def load_text(self, text: str, metadata: dict = None) -> None:
        """Add raw text to vector store"""
        try:
            chunks = self.chunk_text(text)
            
            # Create documents with metadata
            documents = [
                Document(page_content=chunk, metadata=metadata or {})
                for chunk in chunks
            ]
            
            # Add to vector store
            if documents:
                self.vectorstore.add_documents(documents)
                self.vectorstore.persist()
                print(f"Added {len(documents)} text chunks to vector store")
            else:
                print("No chunks created from text")
        
        except Exception as e:
            print(f"Error adding text to vector store: {str(e)}")
    
    def retrieve(self, query: str, k: int = 3) -> List[str]:
        """Retrieve relevant chunks for a query"""
        try:
            retriever = self.vectorstore.as_retriever(
                search_kwargs={"k": k}
            )
            results = retriever.get_relevant_documents(query)
            
            # Extract text from documents
            chunks = [doc.page_content for doc in results]
            return chunks
        
        except Exception as e:
            print(f"Error retrieving chunks: {str(e)}")
            return []
    
    def get_context(self, query: str, k: int = 3) -> str:
        """Get formatted context for LLM"""
        chunks = self.retrieve(query, k)
        
        if not chunks:
            return ""
        
        context = "\n\n---\n\n".join(chunks)
        return f"Reference Information:\n{context}"
    
    def clear_db(self) -> None:
        """Clear vector database"""
        try:
            from shutil import rmtree
            if os.path.exists(self.persist_dir):
                rmtree(self.persist_dir)
            os.makedirs(self.persist_dir, exist_ok=True)
            
            # Reinitialize vector store
            self.vectorstore = Chroma(
                persist_directory=self.persist_dir,
                embedding_function=self.embeddings
            )
            print("Vector database cleared")
        except Exception as e:
            print(f"Error clearing database: {str(e)}")
    
    def get_stats(self) -> dict:
        """Get vector database statistics"""
        try:
            collection = self.vectorstore._collection
            count = collection.count()
            return {
                "total_chunks": count,
                "embedding_model": "all-MiniLM-L6-v2",
                "persist_dir": self.persist_dir
            }
        except Exception as e:
            return {"error": str(e)}


# Global RAG instance
rag_pipeline = None


def init_rag(pdf_dir: str = "data/extracted"):
    """Initialize RAG with PDFs from directory"""
    global rag_pipeline
    
    rag_pipeline = RAGPipeline()
    
    # Load PDFs from directory
    if os.path.exists(pdf_dir):
        pdf_files = list(Path(pdf_dir).glob("*.txt"))
        
        for txt_file in pdf_files:
            try:
                with open(txt_file, 'r', encoding='utf-8') as f:
                    text = f.read()
                    rag_pipeline.load_text(
                        text, 
                        metadata={"source": txt_file.name}
                    )
            except Exception as e:
                print(f"❌ Error loading {txt_file.name}: {str(e)}")
    
    return rag_pipeline


def get_rag() -> RAGPipeline:
    """Get global RAG instance"""
    global rag_pipeline
    if rag_pipeline is None:
        rag_pipeline = RAGPipeline()
    return rag_pipeline
