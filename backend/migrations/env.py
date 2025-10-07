# migrations/env.py
from logging.config import fileConfig
import os
from typing import Optional

from alembic import context
from sqlalchemy import pool
from sqlalchemy.engine import Engine

# ✅ Load .env so DATABASE_URL is available
from dotenv import load_dotenv
load_dotenv()

# ✅ Import your Base/engine from your app
from database import Base, engine

# ✅ Import models so all tables are registered on Base.metadata
#    (User, RefreshToken, AccessTokenBlocklist, Quote, etc.)
import models  # <-- very important

config = context.config

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

def _get_database_url() -> str:
    # Prefer alembic.ini sqlalchemy.url if present, else your app's engine url
    url = config.get_main_option("sqlalchemy.url")
    if not url or url.strip() in {"", "sqlite://"}:
        return str(engine.url)
    return url

def run_migrations_offline() -> None:
    url = _get_database_url()
    config.set_main_option("sqlalchemy.url", url)
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
    connectable: Engine = engine
    with connectable.connect() as connection:
        context.configure(
            connection=connection,
            target_metadata=target_metadata,
            compare_type=True,
            compare_server_default=True,
            transaction_per_migration=True,
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
