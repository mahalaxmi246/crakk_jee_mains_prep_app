# migrations/env.py
from logging.config import fileConfig
from typing import Optional

from alembic import context
from sqlalchemy import pool
from sqlalchemy.engine import Engine

# ⬇️ Import your app's SQLAlchemy Base and engine
# Make sure these paths match your project structure.
# If your file is backend/database.py, and you're running alembic from backend/,
# then "from database import Base, engine" is correct.
from database import Base, engine  # <-- adjust if your module path differs

# Alembic Config object, provides access to values in alembic.ini
config = context.config

# Setup Python logging
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Use your application's metadata for 'autogenerate'
target_metadata = Base.metadata


def _get_database_url() -> str:
    """
    Prefer URL from alembic.ini if set; otherwise fall back to your app engine URL.
    """
    url = config.get_main_option("sqlalchemy.url")
    if not url or url.strip() in {"", "sqlite://"}:
        return str(engine.url)
    return url


def run_migrations_offline() -> None:
    """
    Run migrations in 'offline' mode.
    Configures the context with just a URL and not an Engine.
    """
    url = _get_database_url()
    # Ensure Alembic knows the URL even if alembic.ini doesn't have it
    config.set_main_option("sqlalchemy.url", url)

    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
        compare_type=True,   # detect column type changes
        compare_server_default=True,
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """
    Run migrations in 'online' mode.
    Here we re-use your application's Engine directly.
    """
    # Use the already-created app engine (recommended to keep a single source of truth)
    connectable: Engine = engine

    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,           # detect column type changes
            compare_server_default=True, # detect server default changes
            render_as_batch=False,       # set True if using SQLite with batch ops
            transaction_per_migration=True,
            # include_schemas=True,      # enable if you use multiple schemas
        )

        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
