import psycopg2
from pgvector.psycopg2 import register_vector

# Connect to PostgreSQL
conn = psycopg2.connect(
    host="localhost",       # use "postgres" if inside Docker network
    port=5432,
    dbname="rag_db",
    user="postgres",
    password="password"
)

register_vector(conn)  # Needed so psycopg2 understands vector type
cur = conn.cursor()

# 1. Enable pgvector extension (only once per DB)
cur.execute("CREATE EXTENSION IF NOT EXISTS vector;")

# 2. Create a table with a vector column of dimension 3
cur.execute("""
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    embedding vector(3)
);
""")

# 3. Insert vector data
cur.execute("INSERT INTO items (embedding) VALUES (%s)", ([1, 2, 3],))

# 4. Commit changes
conn.commit()

# 5. Query data
cur.execute("SELECT * FROM items;")
print(cur.fetchall())

cur.close()
conn.close()
