from rest_framework import serializers

from disciplines.models import Discipline
from .models import Question, Source, ResponseType
from disciplines.serializers import DisciplineSerializer

class ResponseTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ResponseType
        fields = ['id', 'name', 'description']


class SourceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Source
        fields = ['id', 'name']


class QuestionSerializer(serializers.ModelSerializer):
    response_types = serializers.PrimaryKeyRelatedField(queryset=ResponseType.objects.all(), many=True)
    disciplines = serializers.PrimaryKeyRelatedField(queryset=Discipline.objects.all(), many=True)

    class Meta:
        model = Question
        fields = ['id', 'text', 'response_types', 'disciplines', 'created_at', 'creator', 'sources', 'citation']
        read_only_fields = ['creator']

    def create(self, validated_data):
        response_types_data = validated_data.pop('response_types', [])
        disciplines_data = validated_data.pop('disciplines', [])
        sources_data = validated_data.pop('sources', [])
        question = Question.objects.create(**validated_data)

        for response_type_data in response_types_data:
            response_type, _ = ResponseType.objects.get_or_create(**response_type_data)
            question.response_types.add(response_type)

        for discipline_data in disciplines_data:
            discipline, _ = Discipline.objects.get_or_create(**discipline_data)
            question.disciplines.add(discipline)

        for source_data in sources_data:
            source, _ = Source.objects.get_or_create(**source_data)
            question.sources.add(source)

        return question
