"""add dpp tables

Revision ID: 26b735626561
Revises: f2e08b083bd8
Create Date: 2025-10-06 12:18:44.130850

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '26b735626561'
down_revision: Union[str, Sequence[str], None] = 'f2e08b083bd8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    pass


def downgrade() -> None:
    """Downgrade schema."""
    pass
