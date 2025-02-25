from django.urls import path
from .views import LoginView, CheckAuthView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('check-auth/', CheckAuthView.as_view(), name='check-auth'),
]
