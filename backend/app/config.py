"""读取配置：开发者改 .env，不需要把密码写进业务代码。"""

from pathlib import Path

from pydantic_settings import BaseSettings, SettingsConfigDict

BACKEND_DIR = Path(__file__).resolve().parent.parent


class Settings(BaseSettings):
    # 固定 .env 的位置，避免从不同目录运行时读不到配置。
    model_config = SettingsConfigDict(
        env_file=BACKEND_DIR / ".env", env_file_encoding="utf-8", extra="ignore"
    )

    database_url: str = "postgresql+psycopg://learn:learn_dev_password@127.0.0.1:5432/learn"
    sql_echo: bool = False


settings = Settings()
