"""数据库模型回答“表里存什么”，不等同于接口输入和输出。"""

from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database import Base


class Note(Base):
    __tablename__ = "notes"
    __table_args__ = (CheckConstraint("length(trim(title)) > 0", name="ck_notes_title_not_blank"),)

    # Mapped[int] 表示 Python 属性类型；mapped_column 描述数据库列。
    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(100))
    content: Mapped[str] = mapped_column(Text, default="")
    # 时间由数据库产生，保存时区信息，前端再按本地时区展示。
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
