from django.db import models
from accounts.models import CustomUser
from questions.models import Question

class QuestionBank(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    creator = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="questionsBank")
    questions = models.ManyToManyField(Question, related_name="banks", blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
