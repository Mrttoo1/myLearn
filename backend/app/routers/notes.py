"""路由层处理 HTTP 语义，数据库操作交给 services。"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy.orm import Session

from app.database import get_session
from app.schemas import NoteInput, NotePage, NoteRead
from app.services import notes

router = APIRouter(prefix="/notes", tags=["学习记录"])
# Depends 表示会话由 FastAPI 调用 get_session 提供，不是前端传进来的。
DatabaseSession = Annotated[Session, Depends(get_session)]


@router.get("", response_model=NotePage, summary="分页查看学习记录")
def list_notes(
    session: DatabaseSession,
    limit: Annotated[int, Query(ge=1, le=100)] = 10,
    offset: Annotated[int, Query(ge=0)] = 0,
):
    items, total = notes.list_notes(session, limit, offset)
    return {"items": items, "total": total, "limit": limit, "offset": offset}


@router.post(
    "", response_model=NoteRead, status_code=status.HTTP_201_CREATED, summary="新增学习记录"
)
def create_note(data: NoteInput, session: DatabaseSession):
    return notes.create_note(session, data)


@router.get("/{note_id}", response_model=NoteRead, summary="查看一条学习记录")
def get_note(note_id: int, session: DatabaseSession):
    note = notes.get_note(session, note_id)
    if note is None:
        raise HTTPException(status_code=404, detail="学习记录不存在")
    return note


@router.put("/{note_id}", response_model=NoteRead, summary="完整更新一条学习记录")
def update_note(note_id: int, data: NoteInput, session: DatabaseSession):
    note = notes.get_note(session, note_id)
    if note is None:
        raise HTTPException(status_code=404, detail="学习记录不存在")
    return notes.update_note(session, note, data)


@router.delete("/{note_id}", status_code=status.HTTP_204_NO_CONTENT, summary="删除一条学习记录")
def delete_note(note_id: int, session: DatabaseSession):
    note = notes.get_note(session, note_id)
    if note is None:
        raise HTTPException(status_code=404, detail="学习记录不存在")
    notes.delete_note(session, note)
    # 204 响应没有 JSON 正文，前端也不应该对它执行 response.json()。
    return Response(status_code=status.HTTP_204_NO_CONTENT)
