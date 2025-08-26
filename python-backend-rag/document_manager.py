from datetime import datetime
import os
import tempfile
from typing import List
from database_manager import DatabaseManager
from vectorstore_manager import VectorStoreManager
from qna_manager import QnaManager
from docling.document_converter import DocumentConverter

from langchain.text_splitter import RecursiveCharacterTextSplitter

from langchain_core.documents import Document
from config import CHUNK_SIZE, CHUNK_OVERLAP, COLLECTION_NAME

class DocumentManager:
    def __init__(self, user_id: int, collection_name= COLLECTION_NAME):
        self.user_id = user_id
        self.collection_name = collection_name
        self.database_manager = DatabaseManager()
        self.vectorstore_manager = VectorStoreManager()
        self.qna_manager = QnaManager(self.user_id)

    def ingest_document(self, doc_ids: List[int]):
        try:
            local_files = [self._download_blob(doc_id) for doc_id in doc_ids]
            print(local_files)
            response = self._ingest_files(local_files)
            if(response['status'] == 'success'):
                    # Update status
                    for doc_id in doc_ids:
                        print(doc_id)
                        self.database_manager.update_document_status(doc_id, 'DONE')
            return response
        except Exception as e:
            msg = str(e)
            return {"status": "failed", "message": msg}


    def query_document(self, query: str):
        # You can implement later
        return self.qna_manager.answer_question(query)

    # ------------------ Private Helpers ------------------

    
    def _clean_text(self, text: str) -> str:
        """
        Cleans text by removing empty lines and page numbers, and converts to lowercase.
        
        Args:
            text (str): The input text to clean.
            
        Returns:
            str: The cleaned text in lowercase.
        """
        if not text:  # Handles None or empty string
            return ""
        
        return "\n".join(
            line.strip().lower() for line in text.split("\n") if line.strip() and not line.strip().isdigit()
        )


    def _download_blob(self, doc_id: int) -> str:

        """
        Downloads a document's binary data to a temporary file and returns the file path.
        
        Args:
            doc_id (int): The ID of the document to retrieve from the database.
            
        Returns:
            str: The path to the temporary file containing the document data.
            
        Raises:
            ValueError: If the document is not found or data is invalid.
            OSError: If file writing fails.
        """
        # Retrieve document data from the database
        try:
            title, extension, data = self.database_manager.get_document_by_id(doc_id)
        except Exception as e:
            raise ValueError(f"Failed to retrieve document with ID {doc_id}: {str(e)}")

        if not data:
            raise ValueError(f"No data found for document ID {doc_id}")

        # Sanitize title for safe file naming
        safe_title = "".join(c if c.isalnum() else "_" for c in title)[:50]  # Limit length and remove unsafe chars
        suffix = f".{extension}" if extension else ""

        # Create a temporary file
        try:
            with tempfile.NamedTemporaryFile(delete=False, suffix=suffix, prefix=f"{safe_title}_") as tmp:
                tmp.write(bytes(data))  # Convert to bytes if necessary
                tmp_path = tmp.name
            return tmp_path
        except OSError as e:
            raise OSError(f"Failed to write temporary file for document ID {doc_id}: {str(e)}")


    def _parse_document(self, source: str) -> List[Document]:
        """
        Parse a document using docling and return a list of LangChain Document objects.
        """
        if not source or not os.path.isfile(source):
            raise FileNotFoundError(f"Document '{source}' not found.")

        try:
            if source.lower().endswith(".txt"):
                with open(source, "r", encoding="utf-8") as f:
                    text = f.read()
                return [Document(page_content=text, metadata={"source": os.path.basename(source)})]
            else:
                converter = DocumentConverter()
                result = converter.convert(source)
                markdown_text = result.document.export_to_markdown()
                return [Document(page_content=markdown_text, metadata={"source": os.path.basename(source)})]

        except Exception as e:
            raise Exception(f"Failed to parse document '{source}': {e}")

    def _ingest_files(self, paths: List[str]) -> str:
        docs: List[Document] = []

        for p in paths:
            loaded_docs = self._parse_document(p)
            # Clean text + enrich metadata
            for d in loaded_docs:
                d.page_content = self._clean_text(d.page_content)
                d.metadata.update({
                    "ingested_at": datetime.utcnow().isoformat(),
                    "user_id": self.user_id,
                })

            docs.extend(loaded_docs)
        print(docs)
        # Chunk documents
        splitter = RecursiveCharacterTextSplitter(
            chunk_size=CHUNK_SIZE,
            chunk_overlap=CHUNK_OVERLAP,
        )
        chunks = splitter.split_documents(docs)
        print(len(chunks))
        print(chunks,self.collection_name)
        # Store in vector DB
        try:
            self.vectorstore_manager.add_documents(chunks)
        except Exception as e:
            print(e)
            raise RuntimeError(f"Error ingesting documents: {str(e)}") from e
        return { "status": "success",
                    "message": f"Ingested {len(chunks)} chunks from {len(paths)} file(s)."
                }
