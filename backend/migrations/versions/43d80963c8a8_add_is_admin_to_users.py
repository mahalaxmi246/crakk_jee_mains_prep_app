"""add is_admin to users

Revision ID: 43d80963c8a8
Revises: 26b735626561
Create Date: 2025-10-06 19:09:20.726540
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '43d80963c8a8'
down_revision: Union[str, Sequence[str], None] = '26b735626561'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # ✅ Add is_admin column with default false
    op.add_column(
        'users',
        sa.Column('is_admin', sa.Boolean(), nullable=False, server_default=sa.text('false'))
    )

def downgrade() -> None:
    # ✅ Remove is_admin column if rolled back
    op.drop_column('users', 'is_admin')
