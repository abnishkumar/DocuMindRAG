from multiprocessing import get_logger
from langchain_openai import OpenAIEmbeddings
from langchain_postgres import PGVector
from config import COLLECTION_NAME, PG_CONNECTION_STRING, EMBEDDING_MODEL

logger=get_logger()

class VectorStoreManager:
    def __init__(self,collection_name=COLLECTION_NAME):
        self.collection_name=collection_name
        self.embeddings = OpenAIEmbeddings(model=EMBEDDING_MODEL)
        self.connection =PG_CONNECTION_STRING


    def get_vectorstore(self) -> PGVector:
        try:
            pg_vector=PGVector(connection=PG_CONNECTION_STRING, 
                    collection_name=self.collection_name, 
                    embeddings=self.embeddings, 
                    use_jsonb=True)
        except Exception as e:
            print(e)
            logger.error(e)
        return pg_vector
    
    def add_documents(self,chunks):
        try:
            PGVector.from_documents(
            documents=chunks,
            embedding=self.embeddings,
            collection_name=self.collection_name,
            connection=self.connection,
            pre_delete_collection=True,
            )
        except Exception as e:
            print(e)
            logger.error(e)
        