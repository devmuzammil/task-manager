from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Task
from .serializers import TaskSerializer, RegisterSerializer

from rest_framework.permissions import IsAuthenticated

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
            task=Task.objects.get(pk=pk,user=request.user)
            serializer=TaskSerializer(task)
    
            return Response(serializer.data)
    
    def put(self, request, pk):
        task = Task.objects.get(pk=pk,user=request.user)
        serializer = TaskSerializer(task, data=request.data)

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self,request,pk):
        task=Task.objects.get(pk=pk,user=request.user)
        task.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class RegisterView(APIView):
    def post(self,request):
        serializer=RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
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