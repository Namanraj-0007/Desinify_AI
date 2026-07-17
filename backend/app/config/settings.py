from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    mongodb_uri: str = 'mongodb://localhost:27017'
    database_name: str = 'designify_ai'
    jwt_secret: str = 'change_me_super_secret'

    jwt_algorithm: str = 'HS256'
    jwt_access_token_expire_minutes: int = 60

    cors_origins: str = 'http://localhost:5173'
    api_prefix: str = '/api'

    # Google OAuth
    google_oauth_client_id: str = ''
    google_oauth_client_secret: str = ''
    google_oauth_redirect_uri: str = ''

    # Defaults correct for Google OAuth; safe to override via env
    google_oauth_scope: str = 'openid email profile'
    google_oauth_authorize_url: str = 'https://accounts.google.com/o/oauth2/v2/auth'
    google_oauth_token_url: str = 'https://oauth2.googleapis.com/token'
    google_oauth_userinfo_url: str = 'https://www.googleapis.com/oauth2/v2/userinfo'

    class Config:
        env_file = '.env'
        extra = 'ignore'


settings = Settings()
