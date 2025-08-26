from urllib.parse import urlparse
from config import PG_CONNECTION_STRING
import psycopg2
import psycopg2.pool


class DatabaseManager:
    def __init__(self):
        self.db_params = self._parse_connection_string()
        self.connection_pool = psycopg2.pool.SimpleConnectionPool(
            1, 10, **self.db_params
        )
        self._enable_pgvector()

    def _parse_connection_string(self):
        """Convert SQLAlchemy-style URL → psycopg2 parameters."""
        url = urlparse(PG_CONNECTION_STRING.replace("+psycopg2", ""))
        return {
            "dbname": url.path[1:],
            "user": url.username,
            "password": url.password,
            "host": url.hostname,
            "port": url.port,
        }

    def _enable_pgvector(self):
        """Enable pgvector extension if not already enabled."""
        conn = self.connection_pool.getconn()
        try:
            conn.autocommit = True
            with conn.cursor() as cur:
                cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")
        finally:
            self.connection_pool.putconn(conn)

    def get_document_by_id(self, doc_id: int):
        """Get document by id from Documents table."""
        conn = self.connection_pool.getconn()
        try:
            with conn.cursor() as cur:
                cur.execute("SELECT title,extension,data FROM \"Documents\" WHERE id = %s", (doc_id,))
                return cur.fetchone()
        except Exception as e:
            print(e)
        finally:
            self.connection_pool.putconn(conn)


    def update_document_status(self, doc_id: int, status: str):
        """Update ingestionStatus in Documents table."""
        conn = self.connection_pool.getconn()
        try:
            with conn.cursor() as cur:
                cur.execute(
                    'UPDATE "Documents" SET "ingestionStatus" = %s WHERE id = %s',
                    (status, doc_id),
                )
            conn.commit()
        except Exception as e:
            print("error in update status",e)
        finally:
            self.connection_pool.putconn(conn)

    def close(self):
        """Close all connections in pool."""
        if self.connection_pool:
            self.connection_pool.closeall()
