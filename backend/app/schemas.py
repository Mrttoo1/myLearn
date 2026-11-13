"""接口数据结构：校验输入，并明确告诉前端会收到哪些字段。"""

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class NoteInput(BaseModel):
    # 创建和完整更新共用输入结构；去掉首尾空白后再校验长度。
    model_config = ConfigDict(str_strip_whitespace=True, extra="forbid")

    title: str = Field(min_length=1, max_length=100, description="学习主题，不能为空")
    content: str = Field(default="", max_length=10000, description="学习内容，最多 10000 字")


class NoteRead(BaseModel):
    # 允许从 SQLAlchemy 对象的属性读取数据，转换为 JSON 响应。
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    content: str
    created_at: datetime
    updated_at: datetime


class NotePage(BaseModel):
    items: list[NoteRead]
    total: int
    limit: int
    offset: int
