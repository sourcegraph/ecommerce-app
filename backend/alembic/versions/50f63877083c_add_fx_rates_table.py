"""add_fx_rates_table

Revision ID: 50f63877083c
Revises: 94404b2e4890
Create Date: 2025-10-03 16:21:30.722478

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '50f63877083c'
down_revision: Union[str, Sequence[str], None] = '94404b2e4890'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        'fx_rates',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('base', sa.String(), nullable=False),
        sa.Column('rates', sa.JSON(), nullable=False),
        sa.Column('fetched_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('fx_rates')
