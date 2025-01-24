from rest_framework.viewsets import ModelViewSet
from .models import Question, Source, ResponseType
from .serializers import QuestionSerializer, SourceSerializer, ResponseTypeSerializer
from rest_framework.permissions import IsAuthenticated

class ResponseTypeViewSet(ModelViewSet):
    queryset = ResponseType.objects.all()
    serializer_class = ResponseTypeSerializer
    permission_classes = [IsAuthenticated]


class QuestionViewSet(ModelViewSet):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)
