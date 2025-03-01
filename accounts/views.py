from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.contrib.auth import authenticate
from rest_framework.authtoken.models import Token
from django.utils.timezone import now
from django.conf import settings
import datetime
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from rest_framework.viewsets import ModelViewSet
from rest_framework.exceptions import AuthenticationFailed, PermissionDenied

from .models import CustomUser
from .serializers import UserSerializer

from django.http import JsonResponse

@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        user = authenticate(username=email, password=password)

        if user:
            token, created = Token.objects.get_or_create(user=user)

            if not created and (now() - token.created) > settings.TOKEN_EXPIRATION_TIME:
                token.delete()
                token = Token.objects.create(user=user)

            response = JsonResponse({
                'message': 'Login realizado com sucesso!',
                'token': token.key,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                }
            })

            response.set_cookie(
                key='authToken',
                value=token.key,
                httponly=True,
                samesite='None',
                secure=True
            )

            return response

        return Response({'error': 'Credenciais inválidas.'}, status=401)


class CheckAuthView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name,
        })


class UserViewSet(ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        if self.request.user.is_superuser:
            return CustomUser.objects.all()
        return CustomUser.objects.filter(id=self.request.user.id)

    def perform_update(self, serializer):
        if serializer.instance != self.request.user and not self.request.user.is_superuser:
            raise PermissionDenied("Você só pode editar seus próprios dados.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance != self.request.user and not self.request.user.is_superuser:
            raise PermissionDenied("Você só pode excluir sua própria conta.")
        instance.delete()
