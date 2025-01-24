from django.db import models

class StudyArea(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name


class Discipline(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    study_area = models.ForeignKey(StudyArea, on_delete=models.CASCADE, related_name="disciplines")

    class Meta:
        unique_together = ('name', 'study_area')

    def __str__(self):
        return self.name
