"""add editable site content and service type"""

from alembic import op
import sqlalchemy as sa

revision = "0003_site_content_service_type"
down_revision = "0002_audit_context"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "services",
        sa.Column("service_type", sa.String(length=100), server_default="عام", nullable=False),
    )
    op.create_table(
        "site_settings",
        sa.Column("key", sa.String(length=80), nullable=False),
        sa.Column("value", sa.Text(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("key"),
    )


def downgrade() -> None:
    op.drop_table("site_settings")
    op.drop_column("services", "service_type")
