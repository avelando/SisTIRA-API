from rest_framework.viewsets import ModelViewSet
from .models import Question, Alternative
from .serializers import QuestionSerializer, AlternativeSerializer

class QuestionViewSet(ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)


class AlternativeViewSet(ModelViewSet):
    queryset = Alternative.objects.all()
    serializer_class = AlternativeSerializer
