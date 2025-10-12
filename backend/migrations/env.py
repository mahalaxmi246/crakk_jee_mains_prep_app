# migrations/env.py
from __future__ import annotations

import os
import sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# --- Make sure Alembic can import your modules without packages ---
# env.py is at <repo>/backend/migrations/env.py
# Your code files are at <repo>/backend/database.py and <repo>/backend/models.py
THIS_DIR = os.path.dirname(__file__)
BACKEND_DIR = os.path.abspath(os.path.join(THIS_DIR, os.pardir))      # .../backend
REPO_ROOT = os.path.abspath(os.path.join(BACKEND_DIR, os.pardir))      # repo root

# Add both backend dir and repo root to sys.path (idempotent)
for p in (BACKEND_DIR, REPO_ROOT):
    if p not in sys.path:
        sys.path.insert(0, p)

# Optional: read DATABASE_URL from .env (if you use it)
try:
    from dotenv import load_dotenv  # pip install python-dotenv
    load_dotenv(os.path.join(BACKEND_DIR, ".env"))
except Exception:
    pass

# If DATABASE_URL is in env/.env, override alembic.ini
db_url = os.getenv("DATABASE_URL")
if db_url:
    config.set_main_option("sqlalchemy.url", db_url)

# --- Import Base + models WITHOUT 'backend.' prefix ---
from database import Base          # backend/database.py
import models                      # backend/models.py (registers models)

target_metadata = Base.metadata

def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,
        compare_server_default=True,
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
