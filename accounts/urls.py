from django.urls import path
from .views import CheckAuthView, LogoutView, UserViewSet, LoginView
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('check-auth/', CheckAuthView.as_view(), name='check-auth'),
    path('logout/', LogoutView.as_view(), name='logout'),
] + router.urls
