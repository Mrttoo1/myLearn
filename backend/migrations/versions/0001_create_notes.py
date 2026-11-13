"""创建学习记录表。迁移文件会进入 Git，数据库通过版本号记录执行进度。"""

import sqlalchemy as sa
from alembic import op

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        "notes",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(100), nullable=False),
        sa.Column("content", sa.Text(), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.Column(
            "updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False
        ),
        sa.CheckConstraint("length(trim(title)) > 0", name="ck_notes_title_not_blank"),
    )


def downgrade():
    # 回退这次建表会删除表及其数据，不能当作普通的撤销编辑操作。
    op.drop_table("notes")
