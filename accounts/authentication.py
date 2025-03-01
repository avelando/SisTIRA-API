import logging
from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed

logger = logging.getLogger(__name__)  # Logger para capturar eventos

class CookieTokenAuthentication(TokenAuthentication):
    def authenticate(self, request):
        token = request.COOKIES.get('authToken')

        if not token:
            logger.warning("🚨 Token não encontrado nos cookies!")  # Log para análise no servidor
            return None

        logger.info(f"🔍 Token recebido no Django: {token}")

        try:
            return self.authenticate_credentials(token)
        except AuthenticationFailed:
            logger.error("🚨 Token inválido!")
            return None
