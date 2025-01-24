from rest_framework import serializers
from .models import Question, Alternative
from disciplines.models import Discipline

class AlternativeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alternative
        fields = ['id', 'content', 'correct']

class QuestionSerializer(serializers.ModelSerializer):
    alternatives = AlternativeSerializer(many=True, required=False)
    disciplines = serializers.PrimaryKeyRelatedField(queryset=Discipline.objects.all(), many=True)

    class Meta:
        model = Question
        fields = ['id', 'text', 'question_type', 'disciplines', 'alternatives', 'created_at', 'creator']
        read_only_fields = ['created_at', 'creator']

    def validate(self, data):
        if data['question_type'] == 'OBJ' and not data.get('alternatives'):
            raise serializers.ValidationError("Questões objetivas devem ter pelo menos uma alternativa.")
        if data['question_type'] == 'SUB' and data.get('alternatives'):
            raise serializers.ValidationError("Questões subjetivas não podem ter alternativas.")
        return data

    def create(self, validated_data):
        alternatives_data = validated_data.pop('alternatives', [])
        disciplines = validated_data.pop('disciplines', [])
        question = Question.objects.create(**validated_data)
        question.disciplines.set(disciplines)

        for alternative_data in alternatives_data:
            Alternative.objects.create(question=question, **alternative_data)

        return question

    def update(self, instance, validated_data):
        alternatives_data = validated_data.pop('alternatives', None)
        disciplines = validated_data.pop('disciplines', [])
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.disciplines.set(disciplines)
        instance.save()

        if alternatives_data is not None:
            instance.alternatives.all().delete()
            for alternative_data in alternatives_data:
                Alternative.objects.create(question=instance, **alternative_data)

        return instance
