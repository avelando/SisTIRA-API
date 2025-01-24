from django.db import models
from disciplines.models import Discipline
from accounts.models import CustomUser as User

class Question(models.Model):
    TYPE_CHOICES = [
        ('OBJ', 'Objetiva'),
        ('SUB', 'Subjetiva'),
    ]
    type = models.CharField(max_length=3, choices=TYPE_CHOICES)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="questions")
    disciplines = models.ManyToManyField(Discipline, related_name="questions")

    def __str__(self):
        return self.text


class Alternative(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="alternatives")
    content = models.TextField()
    correct = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.content} ({'Correta' if self.correct else 'Errada'})"
