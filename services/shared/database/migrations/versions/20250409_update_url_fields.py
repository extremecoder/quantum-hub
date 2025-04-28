"""Update URL fields to Text type

Revision ID: 002
Revises: 001
Create Date: 2025-04-09 10:00:00.000000

This migration changes URL fields from String(255) to Text type to allow for longer URLs.
The Text type in PostgreSQL can store strings of unlimited length, which is important for
fields that might contain long URLs, API keys, or other potentially long string values.

Fields updated:
- user_api_key.value: Changed from String(255) to Text
- platform.api_endpoint: Changed from String(255) to Text
- user_profile.avatar_url: Changed from String(255) to Text
- user_session.token: Changed from String(255) to Text
- user_session.user_agent: Changed from String(255) to Text
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade():
    # Update URL fields in user_api_key table
    op.alter_column('user_api_key', 'value',
                    existing_type=sa.String(length=255),
                    type_=sa.Text(),
                    existing_nullable=False)

    # Update URL fields in platform table
    op.alter_column('platform', 'api_endpoint',
                    existing_type=sa.String(length=255),
                    type_=sa.Text(),
                    existing_nullable=True)

    # Update URL fields in user_profile table
    op.alter_column('user_profile', 'avatar_url',
                    existing_type=sa.String(length=255),
                    type_=sa.Text(),
                    existing_nullable=True)

    # Update URL fields in user_session table
    op.alter_column('user_session', 'token',
                    existing_type=sa.String(length=255),
                    type_=sa.Text(),
                    existing_nullable=False)

    op.alter_column('user_session', 'user_agent',
                    existing_type=sa.String(length=255),
                    type_=sa.Text(),
                    existing_nullable=True)


def downgrade():
    # Revert URL fields in user_session table
    op.alter_column('user_session', 'user_agent',
                    existing_type=sa.Text(),
                    type_=sa.String(length=255),
                    existing_nullable=True)

    op.alter_column('user_session', 'token',
                    existing_type=sa.Text(),
                    type_=sa.String(length=255),
                    existing_nullable=False)

    # Revert URL fields in user_profile table
    op.alter_column('user_profile', 'avatar_url',
                    existing_type=sa.Text(),
                    type_=sa.String(length=255),
                    existing_nullable=True)

    # Revert URL fields in platform table
    op.alter_column('platform', 'api_endpoint',
                    existing_type=sa.Text(),
                    type_=sa.String(length=255),
                    existing_nullable=True)

    # Revert URL fields in user_api_key table
    op.alter_column('user_api_key', 'value',
                    existing_type=sa.Text(),
                    type_=sa.String(length=255),
                    existing_nullable=False)
