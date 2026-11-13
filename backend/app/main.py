"""应用入口。先从这里看接口如何注册，再沿着路由进入业务函数。"""

import logging
from typing import Annotated

from fastapi import Depends, FastAPI, Request
from fastapi.responses import JSONResponse
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.database import get_session
from app.routers.notes import router as notes_router

logger = logging.getLogger(__name__)
app = FastAPI(title="学习项目 API", version="0.1.0", description="从一次 HTTP 请求开始学习后端。")
app.include_router(notes_router, prefix="/api")


@app.get("/api/health", tags=["服务状态"], summary="检查后端和数据库连接")
def health(session: Annotated[Session, Depends(get_session)]):
    # 真正执行一次 SQL；仅仅创建 Engine 不能证明数据库可用。
    session.execute(text("SELECT 1"))
    return {"status": "ok", "database": "connected"}


@app.exception_handler(SQLAlchemyError)
def handle_database_error(request: Request, error: SQLAlchemyError):
    # 详细错误保留在后端日志中，响应不暴露连接字符串和 SQL。
    logger.error("数据库请求失败：%s", request.url.path, exc_info=error)
    return JSONResponse(
        status_code=503, content={"detail": "数据库暂时不可用，请检查数据库和迁移状态"}
    )
