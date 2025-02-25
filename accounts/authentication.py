from rest_framework.authentication import TokenAuthentication
from rest_framework.exceptions import AuthenticationFailed

class CookieTokenAuthentication(TokenAuthentication):
    def authenticate(self, request):
        token = request.COOKIES.get('authToken')

        if not token:
            print("🚨 Token não encontrado nos cookies!")
            return None

        print("🔍 Token recebido no Django:", token)

        try:
            return self.authenticate_credentials(token)
        except AuthenticationFailed:
            print("🚨 Token inválido!")
            return None
