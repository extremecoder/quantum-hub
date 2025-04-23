"""Initial schema

Revision ID: 001
Revises: 
Create Date: 2025-04-08 10:15:00.000000

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # User and authentication tables
    op.create_table(
        'user',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('username', sa.String(length=50), nullable=False),
        sa.Column('email', sa.String(length=100), nullable=False),
        sa.Column('hashed_password', sa.String(length=255), nullable=False),
        sa.Column('full_name', sa.String(length=100), nullable=True),
        sa.Column('roles', postgresql.ARRAY(sa.String()), nullable=False),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('is_provider', sa.Boolean(), nullable=True),
        sa.Column('last_login', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('email'),
        sa.UniqueConstraint('username')
    )
    op.create_index(op.f('ix_user_id'), 'user', ['id'], unique=False)
    
    op.create_table(
        'user_profile',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('organization', sa.String(length=100), nullable=True),
        sa.Column('bio', sa.Text(), nullable=True),
        sa.Column('avatar_url', sa.String(length=255), nullable=True),
        sa.Column('contact_info', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('social_links', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_user_profile_id'), 'user_profile', ['id'], unique=False)
    
    op.create_table(
        'user_api_key',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('value', sa.String(length=255), nullable=False),
        sa.Column('status', sa.Enum('active', 'expired', 'revoked', name='apikeystatus'), nullable=False),
        sa.Column('rate_limit', sa.String(length=50), nullable=True),
        sa.Column('expire_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('last_used_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('value')
    )
    op.create_index(op.f('ix_user_api_key_id'), 'user_api_key', ['id'], unique=False)
    op.create_index(op.f('ix_user_api_key_value'), 'user_api_key', ['value'], unique=False)
    
    op.create_table(
        'user_session',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('token', sa.String(length=255), nullable=False),
        sa.Column('issued_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('expires_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('ip_address', sa.String(length=50), nullable=True),
        sa.Column('user_agent', sa.String(length=255), nullable=True),
        sa.Column('is_active', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('token')
    )
    op.create_index(op.f('ix_user_session_id'), 'user_session', ['id'], unique=False)
    
    # Platform and device tables
    op.create_table(
        'platform',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('provider', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_simulator', sa.Boolean(), nullable=True),
        sa.Column('is_available', sa.Boolean(), nullable=True),
        sa.Column('api_endpoint', sa.String(length=255), nullable=True),
        sa.Column('sdk_integration', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_platform_id'), 'platform', ['id'], unique=False)
    
    op.create_table(
        'device',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('platform_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('is_available', sa.Boolean(), nullable=True),
        sa.Column('num_qubits', sa.Integer(), nullable=False),
        sa.Column('quantum_volume', sa.Integer(), nullable=True),
        sa.Column('properties', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('connectivity_map', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('queue_size', sa.Integer(), nullable=True),
        sa.Column('average_queue_time_seconds', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['platform_id'], ['platform.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_device_id'), 'device', ['id'], unique=False)
    
    # Application tables
    op.create_table(
        'quantum_app',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('developer_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('type', sa.Enum('algorithm', 'circuit', 'model', 'tool', 'agent', 'library', 'other', name='apptype'), nullable=False),
        sa.Column('status', postgresql.ARRAY(sa.String()), nullable=False),
        sa.Column('visibility', sa.Enum('public', 'private', 'restricted', name='appvisibility'), nullable=False),
        sa.Column('latest_version_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('api_url', sa.String(length=255), nullable=True),
        sa.Column('documentation_url', sa.String(length=255), nullable=True),
        sa.Column('license_type', sa.Enum('mit', 'apache2', 'gpl3', 'bsd', 'proprietary', 'other', name='licensetype'), nullable=True),
        sa.Column('license_url', sa.String(length=255), nullable=True),
        sa.Column('readme_content', sa.Text(), nullable=True),
        sa.Column('repository_url', sa.String(length=255), nullable=True),
        sa.Column('is_in_registry', sa.Boolean(), nullable=True),
        sa.Column('registry_published_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('featured_in_registry', sa.Boolean(), nullable=True),
        sa.Column('registry_download_count', sa.Integer(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['developer_id'], ['user.id']),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_quantum_app_id'), 'quantum_app', ['id'], unique=False)
    
    op.create_table(
        'app_version',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('quantum_app_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('version_number', sa.String(length=20), nullable=False),
        sa.Column('sdk_used', sa.Enum('qiskit', 'cirq', 'pennylane', 'quantum_cli', 'qsharp', 'pyquil', 'braket', 'other', name='sdktype'), nullable=False),
        sa.Column('input_schema', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('output_schema', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('built_on_quantum_sdk_version', sa.String(length=50), nullable=True),
        sa.Column('preferred_platform', sa.String(length=50), nullable=True),
        sa.Column('preferred_device_id', sa.String(length=50), nullable=True),
        sa.Column('number_of_qubits', sa.Integer(), nullable=True),
        sa.Column('average_execution_time', sa.String(length=50), nullable=True),
        sa.Column('source_repo', sa.String(length=255), nullable=True),
        sa.Column('source_commit_hash', sa.String(length=100), nullable=True),
        sa.Column('package_path', sa.String(length=255), nullable=True),
        sa.Column('package_data', sa.LargeBinary(), nullable=True),
        sa.Column('ir_type', sa.String(length=50), nullable=True),
        sa.Column('ir_path', sa.String(length=255), nullable=True),
        sa.Column('resource_estimate', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('cost_estimate', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('benchmark_results', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('finetune_params', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('validation_results', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('security_scan_results', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('release_notes', sa.Text(), nullable=True),
        sa.Column('is_latest', sa.Boolean(), nullable=True),
        sa.Column('status', sa.Enum('draft', 'testing', 'released', 'deprecated', name='versionstatus'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['quantum_app_id'], ['quantum_app.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_app_version_id'), 'app_version', ['id'], unique=False)
    op.create_foreign_key('fk_quantum_app_latest_version', 'quantum_app', 'app_version', ['latest_version_id'], ['id'])
    
    op.create_table(
        'project',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('quantum_app_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('repo', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['quantum_app_id'], ['quantum_app.id']),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_project_id'), 'project', ['id'], unique=False)
    
    # Marketplace tables
    op.create_table(
        'marketplace_listing',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('quantum_app_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('listed_by', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('price', sa.Numeric(precision=10, scale=2), nullable=False),
        sa.Column('currency', sa.String(length=3), nullable=False),
        sa.Column('status', sa.Enum('pending', 'active', 'suspended', 'delisted', name='marketplacelistingstatus'), nullable=True),
        sa.Column('rating', sa.Float(), nullable=True),
        sa.Column('rating_count', sa.Integer(), nullable=True),
        sa.Column('preview_enabled', sa.Boolean(), nullable=True),
        sa.Column('support_email', sa.String(length=100), nullable=True),
        sa.Column('support_url', sa.String(length=255), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['listed_by'], ['user.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['quantum_app_id'], ['quantum_app.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('quantum_app_id')
    )
    op.create_index(op.f('ix_marketplace_listing_id'), 'marketplace_listing', ['id'], unique=False)
    
    op.create_table(
        'subscription',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('quantum_app_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('marketplace_listing_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('subscription_type', sa.Enum('free', 'basic', 'professional', 'enterprise', 'custom', name='subscriptiontype'), nullable=False),
        sa.Column('start_date', sa.DateTime(timezone=True), nullable=False),
        sa.Column('end_date', sa.DateTime(timezone=True), nullable=True),
        sa.Column('status', sa.Enum('active', 'expired', 'cancelled', 'suspended', name='subscriptionstatus'), nullable=True),
        sa.Column('service_uri', sa.String(length=255), nullable=True),
        sa.Column('rate', sa.Numeric(precision=10, scale=2), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['marketplace_listing_id'], ['marketplace_listing.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['quantum_app_id'], ['quantum_app.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_subscription_id'), 'subscription', ['id'], unique=False)
    
    op.create_table(
        'subscription_key',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('subscription_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('value', sa.String(length=255), nullable=False),
        sa.Column('type', sa.Enum('free', 'basic', 'professional', 'enterprise', 'custom', name='subscriptiontype'), nullable=False),
        sa.Column('remaining_usage_count', sa.Integer(), nullable=True),
        sa.Column('rate_limit', sa.String(length=50), nullable=True),
        sa.Column('status', sa.Enum('active', 'expired', 'revoked', name='apikeystatus'), nullable=True),
        sa.Column('expire_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['subscription_id'], ['subscription.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('value')
    )
    op.create_index(op.f('ix_subscription_key_id'), 'subscription_key', ['id'], unique=False)
    
    # Execution tables
    op.create_table(
        'job',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('app_version_id', postgresql.UUID(as_uuid=True), nullable=True),
        sa.Column('platform_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('device_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=100), nullable=False),
        sa.Column('type', sa.Enum('simulation', 'hardware', 'hybrid', name='jobtype'), nullable=False),
        sa.Column('status', sa.Enum('created', 'queued', 'running', 'completed', 'failed', 'cancelled', name='jobstatus'), nullable=True),
        sa.Column('priority', sa.Enum('low', 'normal', 'high', 'urgent', name='jobpriority'), nullable=True),
        sa.Column('input_data', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('max_runtime_seconds', sa.Integer(), nullable=True),
        sa.Column('queue_position', sa.Integer(), nullable=True),
        sa.Column('scheduled_for', sa.DateTime(timezone=True), nullable=True),
        sa.Column('started_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('completed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('cost', sa.Float(), nullable=True),
        sa.Column('billing_reference', sa.String(length=100), nullable=True),
        sa.Column('error_message', sa.Text(), nullable=True),
        sa.Column('execution_log', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['app_version_id'], ['app_version.id']),
        sa.ForeignKeyConstraint(['device_id'], ['device.id']),
        sa.ForeignKeyConstraint(['platform_id'], ['platform.id']),
        sa.ForeignKeyConstraint(['user_id'], ['user.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_job_id'), 'job', ['id'], unique=False)
    
    op.create_table(
        'job_result',
        sa.Column('id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('job_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('result_data', postgresql.JSONB(astext_type=sa.Text()), nullable=False),
        sa.Column('raw_data', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('execution_time_ms', sa.Integer(), nullable=True),
        sa.Column('shots', sa.Integer(), nullable=True),
        sa.Column('success_rate', sa.Float(), nullable=True),
        sa.Column('fidelity', sa.Float(), nullable=True),
        sa.Column('visualization_data', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['job_id'], ['job.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('job_id')
    )
    op.create_index(op.f('ix_job_result_id'), 'job_result', ['id'], unique=False)


def downgrade():
    # Drop all tables in reverse order of creation
    op.drop_table('job_result')
    op.drop_table('job')
    op.drop_table('subscription_key')
    op.drop_table('subscription')
    op.drop_table('marketplace_listing')
    op.drop_table('project')
    
    # Remove foreign key constraint before dropping app_version
    op.drop_constraint('fk_quantum_app_latest_version', 'quantum_app', type_='foreignkey')
    op.drop_table('app_version')
    op.drop_table('quantum_app')
    op.drop_table('device')
    op.drop_table('platform')
    op.drop_table('user_session')
    op.drop_table('user_api_key')
    op.drop_table('user_profile')
    op.drop_table('user')
    
    # Drop enum types
    op.execute("DROP TYPE IF EXISTS apikeystatus")
    op.execute("DROP TYPE IF EXISTS apptype")
    op.execute("DROP TYPE IF EXISTS appvisibility")
    op.execute("DROP TYPE IF EXISTS licensetype")
    op.execute("DROP TYPE IF EXISTS sdktype")
    op.execute("DROP TYPE IF EXISTS versionstatus")
    op.execute("DROP TYPE IF EXISTS marketplacelistingstatus")
    op.execute("DROP TYPE IF EXISTS subscriptiontype")
    op.execute("DROP TYPE IF EXISTS subscriptionstatus")
    op.execute("DROP TYPE IF EXISTS jobtype")
    op.execute("DROP TYPE IF EXISTS jobstatus")
    op.execute("DROP TYPE IF EXISTS jobpriority")
