from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('api/admin/', admin.site.urls),
    path('api/auth/', include('rest_framework.urls')),
    path('api/accounts/', include('accounts.urls')),
    path('api/questions/', include('questions.urls')),
    path('api/question-banks/', include('questionsBank.urls')),
    path('api/exams/', include('exams.urls')),
]
