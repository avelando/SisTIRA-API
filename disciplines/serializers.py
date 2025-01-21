from rest_framework import serializers
from .models import AreaOfStudy, Discipline

class AreaOfStudySerializer(serializers.ModelSerializer):
    class Meta:
        model = AreaOfStudy
        fields = ['id', 'name']


class DisciplineSerializer(serializers.ModelSerializer):
    areas_of_study = AreaOfStudySerializer(many=True, read_only=True)

    class Meta:
        model = Discipline
        fields = ['id', 'name', 'areas_of_study']
