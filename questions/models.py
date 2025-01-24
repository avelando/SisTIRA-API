from django.db import models
from accounts.models import CustomUser
from disciplines.models import Discipline

class Question(models.Model):
    QUESTION_TYPES = [
        ('OBJ', 'Objetiva'),
        ('SUB', 'Subjetiva')
    ]

    text = models.TextField() 
    question_type = models.CharField(max_length=3, choices=QUESTION_TYPES)
    disciplines = models.ManyToManyField(Discipline, related_name="questions")
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
