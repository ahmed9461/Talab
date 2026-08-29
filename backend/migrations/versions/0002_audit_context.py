"""add login and terms audit context"""

from alembic import op
import sqlalchemy as sa

revision = "0002_audit_context"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("customers", sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column("terms_acceptances", sa.Column("ip_address", sa.String(length=64), nullable=True))
    op.add_column("terms_acceptances", sa.Column("user_agent", sa.String(length=512), nullable=True))


def downgrade() -> None:
    op.drop_column("terms_acceptances", "user_agent")
    op.drop_column("terms_acceptances", "ip_address")
    op.drop_column("customers", "last_login_at")
