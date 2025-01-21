from ..models import User
from django.core.exceptions import ObjectDoesNotExist

def create_user(name, email):

    if User.objects.filter(email=email).exists():
        raise ValueError("Já existe um usuário com este e-mail.")

    user = User.objects.create(name=name, email=email)
    return user


def get_user_by_id(user_id):
    try:
        user = User.objects.get(id=user_id)
        return user
    except ObjectDoesNotExist:
        raise ValueError("Usuário não encontrado.")


def get_all_users():
    return User.objects.all()


def update_user(user_id, name=None, email=None):
    try:
        user = User.objects.get(id=user_id)
        if email and User.objects.filter(email=email).exclude(id=user_id).exists():
            raise ValueError("Este e-mail já está em uso por outro usuário.")
        
        if name:
            user.name = name
        if email:
            user.email = email
        user.save()
        return user
    except ObjectDoesNotExist:
        raise ValueError("Usuário não encontrado.")


def delete_user(user_id):
    try:
        user = User.objects.get(id=user_id)
        user.delete()
        return {"message": "Usuário deletado com sucesso"}
    except ObjectDoesNotExist:
        raise ValueError("Usuário não encontrado.")
