"""Alembic 读取模型元数据，对数据库执行版本化的结构变更。"""

from logging.config import fileConfig

from alembic import context
from sqlalchemy import create_engine, pool

from app.config import settings
from app.database import Base
from app.models import Note  # noqa: F401  导入模型后，它的表才会登记在 Base.metadata 中。

config = context.config
if config.config_file_name:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata
# 测试可提供独立数据库地址，平时从 backend/.env 读取。
database_url = config.attributes.get("database_url", settings.database_url)


def run_migrations_offline():
    context.configure(url=database_url, target_metadata=target_metadata, literal_binds=True)
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online():
    connectable = create_engine(database_url, poolclass=pool.NullPool)
    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()
    connectable.dispose()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
