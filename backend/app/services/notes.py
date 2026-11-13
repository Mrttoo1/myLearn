"""学习记录的业务和数据库操作。先用普通函数，不增加通用 CRUD 基类。"""

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models import Note
from app.schemas import NoteInput


def list_notes(session: Session, limit: int, offset: int) -> tuple[list[Note], int]:
    total = session.scalar(select(func.count()).select_from(Note)) or 0
    # 排序后再分页。时间相同时用 id 保证顺序稳定。
    statement = select(Note).order_by(Note.created_at.desc(), Note.id.desc())
    items = session.scalars(statement.limit(limit).offset(offset)).all()
    return list(items), total


def get_note(session: Session, note_id: int) -> Note | None:
    return session.get(Note, note_id)


def create_note(session: Session, data: NoteInput) -> Note:
    note = Note(title=data.title, content=data.content)
    session.add(note)
    # add 只登记对象；commit 才真正提交事务，让数据持久保存。
    session.commit()
    # 重新读取数据库生成的 id、创建时间等字段。
    session.refresh(note)
    return note


def update_note(session: Session, note: Note, data: NoteInput) -> Note:
    note.title = data.title
    note.content = data.content
    session.commit()
    session.refresh(note)
    return note


def delete_note(session: Session, note: Note) -> None:
    session.delete(note)
    session.commit()
