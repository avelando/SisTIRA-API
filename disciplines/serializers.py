from rest_framework import serializers
from .models import AreaOfStudy, Discipline

class AreaOfStudySerializer(serializers.ModelSerializer):
    class Meta:
        model = AreaOfStudy
        fields = ['id', 'name']

class DisciplineSerializer(serializers.ModelSerializer):
    areas_of_study = AreaOfStudySerializer(many=True)

    class Meta:
        model = Discipline
        fields = ['id', 'name', 'areas_of_study']

    def create(self, validated_data):
        areas_data = validated_data.pop('areas_of_study', [])
        discipline = Discipline.objects.create(**validated_data)

        for area_data in areas_data:
            area, _ = AreaOfStudy.objects.get_or_create(**area_data)
            discipline.areas_of_study.add(area)

        return discipline

    def update(self, instance, validated_data):
        instance.name = validated_data.get('name', instance.name)
        instance.save()

        areas_data = validated_data.pop('areas_of_study', None)
        if areas_data is not None:
            current_areas = []
            for area_data in areas_data:
                area, _ = AreaOfStudy.objects.get_or_create(**area_data)
                current_areas.append(area.id)

            instance.areas_of_study.set(current_areas)

        return instance
