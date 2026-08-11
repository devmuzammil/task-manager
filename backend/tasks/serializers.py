from django.contrib.auth.models import User
from rest_framework import serializers

from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = "__all__"

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model= User
        fields= ["username","password"]
        extra_kwargs = {
            "password": {"write_only": True}
        }

    def create(self,validate_data):
        user=User.objects.create_user(
            username=validate_data["username"],
            password=validate_data["password"]
        )
        return user