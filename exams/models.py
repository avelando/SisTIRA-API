from django.db import models
from accounts.models import CustomUser
from questions.models import Question
from questionsBank.models import QuestionBank

class Exam(models.Model):
    name = models.CharField(max_length=255) 
    description = models.TextField(blank=True)
    creator = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="exams")
    created_at = models.DateTimeField(auto_now_add=True)
    questions = models.ManyToManyField(Question, related_name="exams", blank=True)
    question_bank = models.ForeignKey(
        QuestionBank, on_delete=models.SET_NULL, null=True, blank=True, related_name="exams"
    )

    def __str__(self):
        return self.name
