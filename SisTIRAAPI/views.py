from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .services.user_services import create_user, get_user_by_id, get_all_users, update_user, delete_user

class UserView(APIView):
    def get(self, request, user_id=None):
        if user_id:
            try:
                user = get_user_by_id(user_id)
                return Response({"id": user.id, "name": user.name, "email": user.email}, status=status.HTTP_200_OK)
            except ValueError as e:
                return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
        else:
            users = get_all_users()
            data = [{"id": user.id, "name": user.name, "email": user.email} for user in users]
            return Response(data, status=status.HTTP_200_OK)

    def post(self, request):
        try:
            user = create_user(name=request.data['name'], email=request.data['email'])
            return Response({"id": user.id, "name": user.name, "email": user.email}, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, user_id):
        try:
            user = update_user(
                user_id=user_id,
                name=request.data.get('name'),
                email=request.data.get('email')
            )
            return Response({"id": user.id, "name": user.name, "email": user.email}, status=status.HTTP_200_OK)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, user_id):
        try:
            result = delete_user(user_id)
            return Response(result, status=status.HTTP_204_NO_CONTENT)
        except ValueError as e:
            return Response({"error": str(e)}, status=status.HTTP_404_NOT_FOUND)
