from django.db import models
from accounts.models import CustomUser
from disciplines.models import Discipline

class ResponseType(models.Model):
    name = models.CharField(max_length=50, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Question(models.Model):
    text = models.TextField()
    response_types = models.ManyToManyField(ResponseType, related_name='questions')
    disciplines = models.ManyToManyField(Discipline, related_name="questions")
    created_at = models.DateTimeField(auto_now_add=True)
    creator = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name="questions")
    sources = models.ManyToManyField('Source', related_name="questions", blank=True)
    citation = models.TextField(blank=True)

    def __str__(self):
        return self.text


class Source(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name
