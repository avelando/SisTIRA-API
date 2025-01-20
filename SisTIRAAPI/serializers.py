from rest_framework import serializers
from .models import (
    User, AreaOfStudy, Discipline, QuestionBank,
    Statement, Question, ObjectiveQuestion, Alternative,
    SubjectiveQuestion, Exam, Room
)

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'email', 'created_at']

class AreaOfStudySerializer(serializers.ModelSerializer):
    class Meta:
        model = AreaOfStudy
        fields = ['id', 'name']

class DisciplineSerializer(serializers.ModelSerializer):
    areas_of_study = AreaOfStudySerializer(many=True, read_only=True)

    class Meta:
        model = Discipline
        fields = ['id', 'name', 'areas_of_study']

class QuestionBankSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionBank
        fields = ['id', 'name', 'info', 'disciplines', 'owner', 'collaborators']

    def validate_name(self, value):
        if QuestionBank.objects.filter(name=value).exists():
            raise serializers.ValidationError("Já existe um banco de questões com esse nome.")
        return value

class StatementSerializer(serializers.ModelSerializer):
    class Meta:
        model = Statement
        fields = ['id', 'text', 'image']

class QuestionSerializer(serializers.ModelSerializer):
    statement = StatementSerializer(read_only=True)
    disciplines = DisciplineSerializer(many=True, read_only=True)
    creator = UserSerializer(read_only=True)

    class Meta:
        model = Question
        fields = ['id', 'type', 'statement', 'disciplines', 'creator', 'question_banks']

class ObjectiveQuestionSerializer(serializers.ModelSerializer):
    alternatives = serializers.PrimaryKeyRelatedField(many=True, read_only=True)

    class Meta:
        model = ObjectiveQuestion
        fields = ['id', 'type', 'statement', 'disciplines', 'creator', 'alternatives']

class AlternativeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alternative
        fields = ['id', 'content', 'correct', 'question']

class ExamSerializer(serializers.ModelSerializer):
    question_banks = QuestionBankSerializer(many=True, read_only=True)
    questions = QuestionSerializer(many=True, read_only=True)
    owner = UserSerializer(read_only=True)

    class Meta:
        model = Exam
        fields = ['id', 'title', 'info', 'time', 'question_banks', 'questions', 'owner', 'collaborators']

class RoomSerializer(serializers.ModelSerializer):
    exams = ExamSerializer(many=True, read_only=True)
    owner = UserSerializer(read_only=True)

    class Meta:
        model = Room
        fields = ['id', 'title', 'info', 'owner', 'participants', 'exams']
