from django.db import models
from accounts.models import CustomUser

class Question(models.Model):
    QUESTION_TYPES = [
        ('OBJ', 'Objetiva'),
        ('SUB', 'Subjetiva'),
    ]

    text = models.TextField()
    question_type = models.CharField(max_length=3, choices=QUESTION_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)
    creator = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="questions")

    def __str__(self):
        return self.text


class Alternative(models.Model):
    question = models.ForeignKey(Question, on_delete=models.CASCADE, related_name="alternatives")
    content = models.TextField()
    correct = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.content} ({'Correta' if self.correct else 'Errada'})"

class Discipline(models.Model):
    name = models.CharField(max_length=100)
    creator = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="disciplines")
    question = models.ForeignKey('Question', on_delete=models.CASCADE, related_name="disciplines")

    def __str__(self):
        return self.name

