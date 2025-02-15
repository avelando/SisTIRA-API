from rest_framework import serializers
from .models import Exam
from questions.models import Question
from questionsBank.models import QuestionBank

class ExamSerializer(serializers.ModelSerializer):
    questions = serializers.PrimaryKeyRelatedField(
        queryset=Question.objects.all(), many=True, required=False
    )

    question_bank = serializers.PrimaryKeyRelatedField(
        queryset=QuestionBank.objects.all(), required=False, allow_null=True
    )

    class Meta:
        model = Exam
        fields = ['id', 'name', 'description', 'creator', 'questions', 'question_bank', 'created_at']
        read_only_fields = ['creator', 'created_at']

    def create(self, validated_data):
        questions_data = validated_data.pop('questions', [])
        question_bank = validated_data.pop('question_bank', None)
        exam = Exam.objects.create(**validated_data)

        if question_bank:
            exam.question_bank = question_bank
            exam.questions.set(question_bank.questions.all())

        elif questions_data:
            exam.questions.set(questions_data)

        exam.save()
        return exam
