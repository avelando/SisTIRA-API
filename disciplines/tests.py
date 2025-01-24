from rest_framework.test import APITestCase
from rest_framework import status

from accounts.models import CustomUser
from .models import StudyArea, Discipline

class DisciplineTests(APITestCase):
    def setUp(self):
        self.user = CustomUser.objects.create_user(username='testuser', password='password')
        self.client.force_authenticate(user=self.user) 

        self.study_area_data = {
            "name": "Ciências Humanas",
            "description": "Área que engloba o estudo da sociedade."
        }
        self.discipline_data = {
            "name": "Geografia",
            "description": "Estudo da Terra.",
            "study_area": self.study_area_data
        }

    def test_create_study_area(self):
        response = self.client.post('/api/disciplines/study-areas/', self.study_area_data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(StudyArea.objects.count(), 1)
        self.assertEqual(StudyArea.objects.first().name, "Ciências Humanas")

    def test_create_discipline_with_study_area(self):
        study_area = StudyArea.objects.create(**self.study_area_data)

        self.discipline_data['study_area'] = study_area.id
        response = self.client.post('/api/disciplines/disciplines/', self.discipline_data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        self.assertEqual(Discipline.objects.count(), 1)
        self.assertEqual(Discipline.objects.first().name, "Geografia")

