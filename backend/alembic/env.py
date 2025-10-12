# alembic/env.py
from __future__ import annotations

import os
import sys
from logging.config import fileConfig

from alembic import context
from sqlalchemy import engine_from_config, pool

# --- Logging from alembic.ini
config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# --- If your project isn't installed as a package, add repo root to PYTHONPATH ---
# Adjust this if needed so "backend" can be imported.
# Example assumes this env.py is at <repo>/alembic/env.py and your code is in <repo>/backend/
repo_root = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
if repo_root not in sys.path:
    sys.path.append(repo_root)

# --- Optional: load DATABASE_URL from .env (if you use it)
try:
    from dotenv import load_dotenv  # pip install python-dotenv
    load_dotenv()
except Exception:
    pass

# If DATABASE_URL is set, override sqlalchemy.url from alembic.ini
db_url = os.getenv("DATABASE_URL")
if db_url:
    config.set_main_option("sqlalchemy.url", db_url)

# --- Import your SQLAlchemy Base and models so Alembic can autogenerate ---
# CHANGE THESE IMPORTS IF YOUR MODULE PATH IS DIFFERENT.
from backend.database import Base  # <-- your declarative_base()
from backend import models          # <-- important: registers all models on Base

# Alembic uses this to detect schema changes
target_metadata = Base.metadata


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode."""
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
    """Run migrations in 'online' mode."""
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
