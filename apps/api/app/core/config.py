from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="AGENT_WATCH_")

    api_title: str = "Agent Watch API"
    api_version: str = "0.1.0"
    api_prefix: str = "/api/v1"
    cors_origins_raw: str = Field(
        default="http://localhost:3000",
        validation_alias="AGENT_WATCH_CORS_ORIGINS",
    )

    @property
    def cors_origins(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins_raw.split(",") if origin.strip()]


settings = Settings()
