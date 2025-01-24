from rest_framework.test import APITestCase
from rest_framework import status
from accounts.models import CustomUser
from disciplines.models import Discipline, StudyArea
from .models import Question, ResponseType

class QuestionTests(APITestCase):
    def setUp(self):
        self.study_area = StudyArea.objects.create(name="Ciências Humanas", description="Testando")
        self.discipline = Discipline.objects.create(name="Geografia", study_area=self.study_area)
        self.response_type = ResponseType.objects.create(name="Alternativa Única", description="Escolha única")
        
        self.user = CustomUser.objects.create_user(username="testuser", password="password")
        self.client.force_authenticate(user=self.user)

        self.question_data = {
            "text": "Qual é a capital do Brasil?",
            "response_types": [{"name": "Alternativa Única"}],
            "disciplines": [{"name": "Geografia"}],
            "citation": "Baseado no ENEM."
        }

    def test_create_response_type(self):
        response = self.client.post('/api/questions/response-types/', {
            "name": "Seleção Múltipla",
            "description": "Escolha múltiplas respostas"
        })
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_create_question(self):
        response_type = ResponseType.objects.create(name="Alternativa Única", description="Escolha uma única alternativa.")
        discipline = Discipline.objects.create(name="Geografia", study_area=self.study_area)

        self.question_data['response_types'] = [{"id": response_type.id}]
        self.question_data['disciplines'] = [{"id": discipline.id}]

        response = self.client.post('/api/questions/questions/', self.question_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(Question.objects.count(), 1)
        question = Question.objects.first()
        self.assertEqual(question.text, "Qual é a capital do Brasil?")
        self.assertEqual(question.creator, self.user)

