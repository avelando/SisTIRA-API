from django.urls import path
from .views import UserViewSet, LoginView, TestAuthView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('test-auth/', TestAuthView.as_view(), name='test-auth'),
] + router.urls
