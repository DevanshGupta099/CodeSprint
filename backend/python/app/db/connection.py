import os
from contextlib import contextmanager
from psycopg2 import pool
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:root@localhost:5432/veritassupply")

# Initialize connection pool (min 1, max 10)
_connection_pool: pool.ThreadedConnectionPool = None


def get_connection_pool() -> pool.ThreadedConnectionPool:
    global _connection_pool
    if _connection_pool is None or _connection_pool.closed:
        _connection_pool = pool.ThreadedConnectionPool(
            minconn=1,
            maxconn=10,
            dsn=DATABASE_URL
        )
    return _connection_pool


@contextmanager
def get_db_cursor(commit: bool = False):
    """Context manager for acquiring a cursor from the connection pool."""
    p = get_connection_pool()
    conn = p.getconn()
    try:
        with conn.cursor() as cur:
            yield cur
        if commit:
            conn.commit()
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        p.putconn(conn)


def check_database_health() -> bool:
    try:
        with get_db_cursor() as cur:
            cur.execute("SELECT 1")
            return cur.fetchone() is not None
    except Exception:
        return False
