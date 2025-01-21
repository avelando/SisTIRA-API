from rest_framework.viewsets import ModelViewSet
from .models import AreaOfStudy, Discipline
from .serializers import AreaOfStudySerializer, DisciplineSerializer

class AreaOfStudyViewSet(ModelViewSet):
    queryset = AreaOfStudy.objects.all()
    serializer_class = AreaOfStudySerializer

class DisciplineViewSet(ModelViewSet):
    queryset = Discipline.objects.all()
    serializer_class = DisciplineSerializer
