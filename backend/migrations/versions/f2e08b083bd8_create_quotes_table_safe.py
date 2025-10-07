"""create quotes table (safe)

Revision ID: f2e08b083bd8
Revises: 8c23691f18b3   # ✅ important: point to the GOOD previous migration
Create Date: 2025-10-05 18:38:58.859841
"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'f2e08b083bd8'
down_revision: Union[str, Sequence[str], None] = '8c23691f18b3'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    op.create_table(
        "quotes",
        sa.Column("id", sa.Integer(), primary_key=True, nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("author", sa.String(length=255), nullable=True),
    )
    op.create_index("ix_quotes_id", "quotes", ["id"])

def downgrade() -> None:
    op.drop_index("ix_quotes_id", table_name="quotes")
    op.drop_table("quotes")
