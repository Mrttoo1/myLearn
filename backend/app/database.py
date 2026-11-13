"""数据库连接和会话。会话可以理解为一次请求操作数据库的工作空间。"""

from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.config import settings


class Base(DeclarativeBase):
    """所有数据库模型共用的基类，汇总表结构供 Alembic 读取。"""


# Engine 管理连接池；创建 Engine 本身还不会连接数据库。
engine = create_engine(
    settings.database_url,
    echo=settings.sql_echo,
    pool_pre_ping=True,
    connect_args={"connect_timeout": 5},
)
SessionLocal = sessionmaker(bind=engine)


def get_session() -> Generator[Session]:
    """每个请求使用自己的会话，结束时归还连接。"""
    with SessionLocal() as session:
        try:
            # yield 把会话交给接口函数；请求结束后会回到这里继续清理。
            yield session
        except Exception:
            # 出错时撤销尚未提交的修改，再将异常交给上层处理。
            session.rollback()
            raise
