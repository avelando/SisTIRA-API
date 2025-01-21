from rest_framework.viewsets import ModelViewSet
from .models import User
from .serializers import UserSerializer

class UserViewSet(ModelViewSet):
    """
    ViewSet para gerenciar usuários.
    Permite listar, criar, atualizar e excluir usuários.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
