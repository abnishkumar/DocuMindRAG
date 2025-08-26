
SYSTEM_PROMPT = (
    "You are a helpful assistant. Use the provided context to answer "
    "the user's question. If the answer is not in the context, say you don't know."
)

ANSWER_PROMPT_TEMPLATE = """You are a helpful, factual assistant.
Only use the provided context to answer the user's question. Do NOT use any outside knowledge.

Context:
{context}

Question:
{question}

Answer:
"""