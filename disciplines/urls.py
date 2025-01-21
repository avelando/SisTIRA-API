from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AreaOfStudyViewSet, DisciplineViewSet

router = DefaultRouter()
router.register(r'areas-of-study', AreaOfStudyViewSet, basename='areaofstudy')
router.register(r'disciplines', DisciplineViewSet, basename='discipline')

urlpatterns = [
    path('', include(router.urls)),
]
