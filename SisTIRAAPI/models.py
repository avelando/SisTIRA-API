from django.db import models


class User(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class AreaOfStudy(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name


class Discipline(models.Model):
    name = models.CharField(max_length=255)
    areas_of_study = models.ManyToManyField(AreaOfStudy, related_name="disciplines")

    def __str__(self):
        return self.name


class QuestionBank(models.Model):
    name = models.CharField(max_length=255)
    info = models.TextField(null=True, blank=True)
    disciplines = models.ManyToManyField(Discipline, related_name="question_banks")
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="owned_question_banks")
    collaborators = models.ManyToManyField(User, related_name="collaborative_question_banks")

    def __str__(self):
        return self.name


class Statement(models.Model):
    text = models.TextField(null=True, blank=True)
    image = models.URLField(null=True, blank=True)

    def __str__(self):
        return self.text or "Imagem"


class Question(models.Model):
    TYPE_CHOICES = [
        ('OBJ', 'Objetiva'),
        ('SUB', 'Subjetiva'),
    ]
    type = models.CharField(max_length=3, choices=TYPE_CHOICES)
    statement = models.ForeignKey(Statement, on_delete=models.CASCADE, related_name="questions")
    disciplines = models.ManyToManyField(Discipline, related_name="questions")
    creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name="created_questions")
    question_banks = models.ManyToManyField(QuestionBank, related_name="questions", blank=True)

    def __str__(self):
        return f"{self.get_type_display()} - {self.statement}"


class ObjectiveQuestion(Question):
    pass


class Alternative(models.Model):
    content = models.TextField()
    correct = models.BooleanField(default=False)
    question = models.ForeignKey(ObjectiveQuestion, on_delete=models.CASCADE, related_name="alternatives")

    def __str__(self):
        return f"Alternativa: {self.content} {'(Correta)' if self.correct else ''}"


class SubjectiveQuestion(Question):
    pass


class Exam(models.Model):
    title = models.CharField(max_length=255)
    info = models.TextField(null=True, blank=True)
    time = models.IntegerField()
    question_banks = models.ManyToManyField(QuestionBank, related_name="exams", blank=True)
    questions = models.ManyToManyField(Question, related_name="exams", blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="owned_exams")
    collaborators = models.ManyToManyField(User, related_name="collaborative_exams")

    def __str__(self):
        return self.title


class Room(models.Model):
    title = models.CharField(max_length=255)
    info = models.TextField(null=True, blank=True)
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="owned_rooms")
    participants = models.ManyToManyField(User, related_name="rooms")
    exams = models.ManyToManyField(Exam, related_name="rooms")

    def __str__(self):
        return self.title
