from rest_framework.viewsets import ModelViewSet
from disciplines.models import Discipline
from .models import Question
from .serializers import QuestionSerializer, DisciplineSerializer

class DisciplineViewSet(ModelViewSet):
    queryset = Discipline.objects.all()
    serializer_class = DisciplineSerializer


class QuestionViewSet(ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)
