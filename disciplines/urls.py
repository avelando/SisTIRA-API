from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import StudyAreaViewSet, DisciplineViewSet

router = DefaultRouter()
router.register(r'study-areas', StudyAreaViewSet, basename='study-area')
router.register(r'disciplines', DisciplineViewSet, basename='discipline')

urlpatterns = [
    path('', include(router.urls)),
]
