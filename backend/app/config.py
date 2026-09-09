from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    DEMO_MODE: bool = True
    GEMINI_API_KEY: Optional[str] = None
    GEMINI_MODEL: str = "gemini-3.8-flash"
    
    # Grafana Cloud Settings
    GRAFANA_URL: str = "https://demo.grafana.net"
    GRAFANA_SA_TOKEN: Optional[str] = None
    GRAFANA_PROMETHEUS_ENDPOINT: Optional[str] = None
    GRAFANA_PROMETHEUS_USER: Optional[str] = None
    GRAFANA_LOKI_ENDPOINT: Optional[str] = None
    GRAFANA_LOKI_USER: Optional[str] = None
    
    # Server Settings
    PORT: int = 8001
    HOST: str = "0.0.0.0"
    SECRET_KEY: str = "directorops-secret-hmac-key-2026"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
