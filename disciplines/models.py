from django.db import models

class AreaOfStudy(models.Model):
    name = models.CharField(max_length=255, unique=True)

    def __str__(self):
        return self.name


class Discipline(models.Model):
    name = models.CharField(max_length=255, unique=True)
    areas_of_study = models.ManyToManyField(AreaOfStudy, related_name="disciplines")

    def __str__(self):
        return self.name
