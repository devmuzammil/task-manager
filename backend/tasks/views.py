from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Task
from .serializers import TaskSerializer, RegisterSerializer, ForgetPasswordSerializer,ResetPasswordSerializer

from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from django.contrib.auth.tokens import default_token_generator
from django.shortcuts import get_object_or_404
from rest_framework_simplejwt.tokens import RefreshToken
import resend
from django.conf import settings

class TaskListView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request):
        tasks=Task.objects.filter(user=request.user)
        serializer= TaskSerializer(tasks,many=True)

        return Response(serializer.data)

    def post(self,request):
        serializer=TaskSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED,
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class TaskDetailView(APIView):
    permission_classes = [IsAuthenticated]
    def get(self,request,pk):
        task = get_object_or_404(Task, pk=pk, user=request.user)
        serializer = TaskSerializer(task)

        return Response(serializer.data)

    def put(self, request, pk):
        task = get_object_or_404(Task, pk=pk, user=request.user)
        serializer = TaskSerializer(task, data=request.data, partial=True)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        task = get_object_or_404(Task, pk=pk, user=request.user)
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class RegisterView(APIView):
    def post(self,request):
        serializer=RegisterSerializer(data=request.data)
        if serializer.is_valid():
            user= serializer.save()
            token=default_token_generator.make_token(user)
            verification_link = (
                f"{settings.FRONTEND_URL}/verify-email/"
                f"{user.id}/{token}/"
            )
            resend.api_key = settings.RESEND_API_KEY
            resend.Emails.send({
                "from": "onboarding@resend.dev",
                "to": [user.email],
                "subject": "Verify your Task Manager email",
                "html": f"""
                    <h2>Verify your email</h2>

                    <p>Thanks for registering for Task Manager.</p>

                    <p>
                        <a href="{verification_link}">
                            Verify Email
                        </a>
                    </p>
                """
            })
            return Response(
                {
                    "message":"User Created Successfully",
                },
                status=status.HTTP_201_CREATED
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        ) 

class ForgetPasswordView(APIView):
    def post(self,request):
        serializer=ForgetPasswordSerializer(data=request.data)

        if serializer.is_valid():
            email=serializer.validated_data["email"]
            user=User.objects.get(email=email)

            token = default_token_generator.make_token(user)

            print("Token:",token)

            reset_link = f"{settings.FRONTEND_URL}/reset-password/{user.id}/{token}/"

            resend.api_key = settings.RESEND_API_KEY

            resend.Emails.send({
                "from": "onboarding@resend.dev",
                "to": [user.email],
                "subject": "Reset your Task Manager password",
                "html": f"""
                    <h2>Password Reset</h2>
                    <p>You requested to reset your password.</p>
                    <p>
                        <a href="{reset_link}">
                            Reset Password
                        </a>
                    </p>
                    <p>If you did not request this, you can ignore this email.</p>
                """
            })

            return Response(
                {
                    "message": "Password reset email sent."
                },
                status=status.HTTP_200_OK
            )
        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class ResetPasswordView(APIView):
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)

        if serializer.is_valid():
            user = serializer.validated_data["user"]
            new_password = serializer.validated_data["new_password"]

            user.set_password(new_password)
            user.save()

            return Response(
                {
                    "message": "Password reset successfully."
                },
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class VerifyEmailView(APIView):
    def get(self, request, user_id, token):
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response(
                {"error": "Invalid verification link."},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not default_token_generator.check_token(user, token):
            return Response(
                {"error": "Invalid or expired verification link."},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.is_active = True
        user.save()

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "message": "Email verified successfully.",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
            },
            status=status.HTTP_200_OK
        )