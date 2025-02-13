from rest_framework import serializers
from .models import QuestionBank
from questions.models import Question

class QuestionBankSerializer(serializers.ModelSerializer):
    questions = serializers.PrimaryKeyRelatedField(
        queryset=Question.objects.all(), many=True, required=False
    )

    class Meta:
        model = QuestionBank
        fields = ['id', 'name', 'description', 'creator', 'questions', 'created_at']
        read_only_fields = ['creator', 'created_at']

    def create(self, validated_data):
        questions_data = validated_data.pop('questions', [])
        question_bank = QuestionBank.objects.create(**validated_data)

        question_bank.questions.set(questions_data)

        return question_bank
