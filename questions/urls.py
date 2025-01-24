from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuestionViewSet, ResponseTypeViewSet

router = DefaultRouter()
router.register(r'questions', QuestionViewSet, basename='question')
router.register(r'response-types', ResponseTypeViewSet, basename='response-type')

urlpatterns = [
    path('', include(router.urls)),
]
