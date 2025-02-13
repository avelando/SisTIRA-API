from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuestionBankViewSet

router = DefaultRouter()
router.register(r'question-banks', QuestionBankViewSet, basename='question-bank')

urlpatterns = [
    path('', include(router.urls)),
]
