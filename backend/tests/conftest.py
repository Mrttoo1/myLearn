"""在独立 PostgreSQL 测试库中执行迁移，每个测试用事务回滚隔离数据。"""

import os

import pytest
from alembic import command
from alembic.config import Config
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session

from app.config import BACKEND_DIR
from app.database import get_session
from app.main import app


@pytest.fixture(scope="session")
def test_engine():
    # 不使用业务数据库的默认地址，避免测试意外写入真实数据。
    database_url = os.getenv("TEST_DATABASE_URL")
    if not database_url:
        pytest.fail("请设置 TEST_DATABASE_URL，指向独立的 PostgreSQL 测试库（库名以 _test 结尾）")
    if not (make_url(database_url).database or "").endswith("_test"):
        pytest.fail("测试数据库名必须以 _test 结尾")

    config = Config(str(BACKEND_DIR / "alembic.ini"))
    config.attributes["database_url"] = database_url
    command.upgrade(config, "head")
    engine = create_engine(database_url)
    yield engine
    engine.dispose()


@pytest.fixture
def client(test_engine):
    with test_engine.connect() as connection:
        transaction = connection.begin()
        # 接口中 commit 提交的是保存点；外层事务仍可在测试后整体回滚。
        session = Session(bind=connection, join_transaction_mode="create_savepoint")

        def override_session():
            yield session

        app.dependency_overrides[get_session] = override_session
        try:
            with TestClient(app) as test_client:
                yield test_client
        finally:
            app.dependency_overrides.clear()
            session.close()
            transaction.rollback()
