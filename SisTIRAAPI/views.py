from rest_framework.viewsets import ModelViewSet
from .models import User, Discipline, QuestionBank, Exam, Room
from .serializers import (
    UserSerializer, DisciplineSerializer, QuestionBankSerializer,
    ExamSerializer, RoomSerializer
)

class UserViewSet(ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class DisciplineViewSet(ModelViewSet):
    queryset = Discipline.objects.all()
    serializer_class = DisciplineSerializer

class QuestionBankViewSet(ModelViewSet):
    queryset = QuestionBank.objects.all()
    serializer_class = QuestionBankSerializer

class ExamViewSet(ModelViewSet):
    queryset = Exam.objects.all()
    serializer_class = ExamSerializer

class RoomViewSet(ModelViewSet):
    queryset = Room.objects.all()
    serializer_class = RoomSerializer
