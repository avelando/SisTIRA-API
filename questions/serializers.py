
from rest_framework import serializers
from disciplines.models import Discipline
from disciplines.serializers import DisciplineSerializer
from .models import Question, Alternative

class AlternativeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alternative
        fields = ['id', 'content', 'correct']


class QuestionSerializer(serializers.ModelSerializer):
    alternatives = AlternativeSerializer(many=True, required=False)
    disciplines = DisciplineSerializer(many=True)

    class Meta:
        model = Question
        fields = ['id', 'type', 'text', 'created_at', 'creator', 'disciplines', 'alternatives']
        read_only_fields = ['creator']

    def create(self, validated_data):
        disciplines_data = validated_data.pop('disciplines', [])
        alternatives_data = validated_data.pop('alternatives', [])
        question = Question.objects.create(**validated_data)

        for discipline_data in disciplines_data:
            discipline, _ = Discipline.objects.get_or_create(**discipline_data)
            question.disciplines.add(discipline)

        for alternative_data in alternatives_data:
            Alternative.objects.create(question=question, **alternative_data)

        return question
