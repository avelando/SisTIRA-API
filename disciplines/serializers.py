from rest_framework import serializers
from .models import StudyArea, Discipline

class StudyAreaSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudyArea
        fields = ['id', 'name', 'description']


class DisciplineSerializer(serializers.ModelSerializer):
    study_area = serializers.PrimaryKeyRelatedField(queryset=StudyArea.objects.all())

    class Meta:
        model = Discipline
        fields = ['id', 'name', 'description', 'study_area']

    def create(self, validated_data):
        return Discipline.objects.create(**validated_data)
