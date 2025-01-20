from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, DisciplineViewSet, QuestionBankViewSet, ExamViewSet, RoomViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'disciplines', DisciplineViewSet, basename='discipline')
router.register(r'question-banks', QuestionBankViewSet, basename='question-bank')
router.register(r'exams', ExamViewSet, basename='exam')
router.register(r'rooms', RoomViewSet, basename='room')

urlpatterns = [
    path('', include(router.urls)),
]
