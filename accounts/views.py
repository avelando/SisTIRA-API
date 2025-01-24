from rest_framework.viewsets import ModelViewSet
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.exceptions import AuthenticationFailed, PermissionDenied
from django.contrib.auth import authenticate
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from .models import CustomUser
from .serializers import UserSerializer
from rest_framework.authtoken.models import Token

class UserViewSet(ModelViewSet):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer

    def get_permissions(self):
        if self.action == 'create':
            return [AllowAny()]
        return [IsAuthenticated()]

    def get_queryset(self):
        if not self.request.user.is_admin:
            raise PermissionDenied("Apenas administradores podem listar usuários.")
        return super().get_queryset()

    def perform_update(self, serializer):
        if not self.request.user.is_admin and serializer.instance != self.request.user:
            raise PermissionDenied("Você só pode editar sua própria conta.")
        serializer.save()

    def perform_destroy(self, instance):
        if not self.request.user.is_admin and instance != self.request.user:
            raise PermissionDenied("Você só pode excluir sua própria conta.")
        instance.delete()


@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        user = authenticate(request, username=email, password=password)

        if user is not None:
            token, created = Token.objects.get_or_create(user=user)

            return Response({
                'message': 'Login realizado com sucesso!',
                'token': token.key,
                'user_id': user.id
            }, status=200)
        else:
            return Response({'error': 'Credenciais inválidas.'}, status=401)
        
@method_decorator(csrf_exempt, name='dispatch')
class TestAuthView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({'message': 'Autenticação funcionando!', 'user': request.user.username})
