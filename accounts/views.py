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
from django.http import JsonResponse


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


@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        user = authenticate(request, username=email, password=password)

        if user is not None:
            token, created = Token.objects.get_or_create(user=user)

            response = JsonResponse({
                'message': 'Login realizado com sucesso!',
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
                secure=True,
                samesite='Lax'
            )

            return response
        else:
            return Response({'error': 'Credenciais inválidas.'}, status=401)
        
        
@method_decorator(csrf_exempt, name='dispatch')
class TestAuthView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({'message': 'Autenticação funcionando!', 'user': request.user.username})


class CheckAuthView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'id': request.user.id,
            'username': request.user.username,
            'email': request.user.email,
            'first_name': request.user.first_name,
            'last_name': request.user.last_name
        })


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        request.user.auth_token.delete()
        
        response = Response({"message": "Logout realizado com sucesso!"})
        response.delete_cookie('authToken')
        return response
    
