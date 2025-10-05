"""init schema

Revision ID: 0447bb6d17e4
Revises: 
Create Date: 2025-10-04 20:41:45.666992

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '0447bb6d17e4'
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema: create tables and indexes."""
    # --- users table ---
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(length=50), nullable=False),
        sa.Column('email', sa.String(length=255), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.PrimaryKeyConstraint('id', name=op.f('users_pkey'))
    )
    op.create_index(op.f('ix_users_id'), 'users', ['id'], unique=False)
    op.create_index(op.f('ix_users_username'), 'users', ['username'], unique=True)
    op.create_index(op.f('ix_users_email'), 'users', ['email'], unique=True)

    # --- refresh_tokens table ---
    op.create_table(
        'refresh_tokens',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('jti', sa.String(length=64), nullable=False),
        sa.Column('username', sa.String(length=50), nullable=False),
        sa.Column('expires_at', postgresql.TIMESTAMP(timezone=True), nullable=False),
        sa.Column('revoked', sa.Boolean(), nullable=False),
        sa.PrimaryKeyConstraint('id', name=op.f('refresh_tokens_pkey'))
    )
    op.create_index(op.f('ix_refresh_tokens_id'), 'refresh_tokens', ['id'], unique=False)
    op.create_index(op.f('ix_refresh_tokens_jti'), 'refresh_tokens', ['jti'], unique=True)
    op.create_index(op.f('ix_refresh_tokens_username'), 'refresh_tokens', ['username'], unique=False)

    # --- access_token_blocklist table ---
    op.create_table(
        'access_token_blocklist',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('jti', sa.String(length=64), nullable=False),
        sa.Column('expires_at', postgresql.TIMESTAMP(timezone=True), nullable=False),
        sa.PrimaryKeyConstraint('id', name=op.f('access_token_blocklist_pkey'))
    )
    op.create_index(op.f('ix_access_token_blocklist_id'), 'access_token_blocklist', ['id'], unique=False)
    op.create_index(op.f('ix_access_token_blocklist_jti'), 'access_token_blocklist', ['jti'], unique=True)


def downgrade() -> None:
    """Downgrade schema: drop tables and indexes."""
    # Drop in reverse order to avoid foreign key issues
    op.drop_index(op.f('ix_access_token_blocklist_jti'), table_name='access_token_blocklist')
    op.drop_index(op.f('ix_access_token_blocklist_id'), table_name='access_token_blocklist')
    op.drop_table('access_token_blocklist')

    op.drop_index(op.f('ix_refresh_tokens_username'), table_name='refresh_tokens')
    op.drop_index(op.f('ix_refresh_tokens_jti'), table_name='refresh_tokens')
    op.drop_index(op.f('ix_refresh_tokens_id'), table_name='refresh_tokens')
    op.drop_table('refresh_tokens')

    op.drop_index(op.f('ix_users_email'), table_name='users')
    op.drop_index(op.f('ix_users_username'), table_name='users')
    op.drop_index(op.f('ix_users_id'), table_name='users')
    op.drop_table('users')
