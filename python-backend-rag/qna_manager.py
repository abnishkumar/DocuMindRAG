from typing import Any, Dict, List, Optional, Tuple
from vectorstore_manager import VectorStoreManager
from config import CHAT_MODEL, MMR_FETCH_K, MMR_K, OPENAI_API_KEY, RERANK_TOP_K, TOP_K
from prompts import ANSWER_PROMPT_TEMPLATE
import os

from langchain_core.documents import Document
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser


class QnaManager:
    """
    QnA Manager that retrieves documents, reranks them, and generates
    answers using an LLM with context.
    """

    _cross_encoder = None
    _cross_encoder_available = False

    try:
        from sentence_transformers import CrossEncoder
        _cross_encoder = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")
        _cross_encoder_available = True
    except Exception:
        pass

    os.environ["OPENAI_API_KEY"] = OPENAI_API_KEY

    def __init__(self, user_id: Optional[int] = None):
        self.user_id = user_id
        self.vectorstore_manager = VectorStoreManager()
        self.llm = ChatOpenAI(model=CHAT_MODEL, temperature=0)

        # Build retriever & reranker once
        self.retriever, self.reranker = self._build_retriever_and_reranker()

        # Build RAG chain
        self.rag_chain = self._build_rag_chain()

    def answer_question(self, question: str) -> Dict[str, Any]:
        """
        Main entrypoint: runs the RAG chain and attaches source snippets.
        """
        if not question:
            return {"answer": "No question provided.","sources": sources}
        
        question=question.lower().strip()
        # Run RAG pipeline
        answer_text = self.rag_chain.invoke(question)

        # Also rerank manually for sources (rag_chain only returns final text)
        candidates = self.retriever.invoke(question)
        reranked = self._rerank_documents(question, candidates, self.reranker, top_k=int(RERANK_TOP_K))

        sources = [
            {
                "source": d.metadata.get("source", "unknown"),
                "snippet": (d.page_content[:300] + "...") if len(d.page_content) > 300 else d.page_content,
            }
            for d in reranked
        ]

        return {"answer": answer_text, "sources": sources}

    # ----------------- Helpers -----------------

    def _build_rag_chain(self):
        """
        Builds the LangChain-style composable RAG chain:
          {"context": retriever|format_docs, "question": passthrough} -> prompt -> model -> parser
        """
        prompt = PromptTemplate(
            template=ANSWER_PROMPT_TEMPLATE,
            input_variables=["context", "question"],
        )

        rag_chain = (
            {
                "context": self.retriever | self._format_docs,
                "question": RunnablePassthrough()
            }
            | prompt
            | self.llm
            | StrOutputParser()
        )
        return rag_chain

    def _rerank_documents(
        self, query: str, docs: List[Document], reranker, top_k: int
    ) -> List[Document]:
        """Rerank documents using CrossEncoder if available, else truncate."""
        if not docs:
            return []
        if reranker is None:
            return docs[:top_k]

        pairs = [(query, d.page_content) for d in docs]
        scores = reranker.predict(pairs)
        ranked = sorted(zip(docs, scores), key=lambda x: x[1], reverse=True)
        return [d for d, _ in ranked[:top_k]]

    def _build_retriever_and_reranker(self) -> Tuple[Any, Optional[Any]]:
        """Build retriever (with user filter) and optionally attach reranker."""
        vs = self.vectorstore_manager.get_vectorstore()
        search_kwargs = {
            "k": int(MMR_K or TOP_K),
            "fetch_k": int(MMR_FETCH_K or (int(MMR_K or TOP_K) * 3)),
            "lambda_mult": 0.5,
        }
        if self.user_id!=1:
            search_kwargs["filter"] = {"user_id": self.user_id}

        retriever = vs.as_retriever(search_type="mmr", search_kwargs=search_kwargs)
        reranker = self._cross_encoder if self._cross_encoder_available else None
        return retriever, reranker

    @staticmethod
    def _format_docs(docs: List[Document]) -> str:
        """Format documents into a context string for prompting."""
        return "\n\n".join(d.page_content for d in docs)
