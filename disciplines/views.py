from rest_framework.viewsets import ModelViewSet
from .models import Discipline, StudyArea
from .serializers import DisciplineSerializer, StudyAreaSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import PermissionDenied

class IsAdminPermission(IsAuthenticated):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.is_superuser


class StudyAreaViewSet(ModelViewSet):
    queryset = StudyArea.objects.all()
    serializer_class = StudyAreaSerializer
    permission_classes = [IsAdminPermission]


class DisciplineViewSet(ModelViewSet):
    queryset = Discipline.objects.all()
    serializer_class = DisciplineSerializer
    permission_classes = [IsAdminPermission]
