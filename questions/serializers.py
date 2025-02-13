from rest_framework import serializers
from .models import Question, Alternative, Discipline

class DisciplineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Discipline
        fields = ['id', 'name', 'creator', 'question']
        read_only_fields = ['creator', 'question']

class AlternativeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alternative
        fields = ['id', 'content', 'correct']

class QuestionSerializer(serializers.ModelSerializer):
    alternatives = AlternativeSerializer(many=True, required=False)
    disciplines = serializers.ListField(
        child=serializers.CharField(), write_only=True
    )

    class Meta:
        model = Question
        fields = ['id', 'text', 'question_type', 'disciplines', 'alternatives', 'created_at', 'creator']
        read_only_fields = ['created_at', 'creator']

    def create(self, validated_data):
        disciplines_data = validated_data.pop('disciplines', [])
        alternatives_data = validated_data.pop('alternatives', [])
        question = Question.objects.create(**validated_data)

        for discipline_name in disciplines_data:
            Discipline.objects.create(
                name=discipline_name,
                creator=self.context['request'].user,
                question=question
            )

        for alternative_data in alternatives_data:
            Alternative.objects.create(question=question, **alternative_data)

        return question
