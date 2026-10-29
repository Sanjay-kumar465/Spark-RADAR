"""add_google_auth_fields

Revision ID: 47caa5087fb2
Revises: 36cb421d1a5e
Create Date: 2026-10-29 20:07:03.621232

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '47caa5087fb2'
down_revision: Union[str, Sequence[str], None] = '36cb421d1a5e'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('users', sa.Column('google_id', sa.String(length=255), nullable=True))
    op.add_column('users', sa.Column('auth_provider', sa.String(length=50), nullable=True, server_default='email'))
    op.create_index(op.f('ix_users_google_id'), 'users', ['google_id'], unique=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f('ix_users_google_id'), table_name='users')
    op.drop_column('users', 'auth_provider')
    op.drop_column('users', 'google_id')
