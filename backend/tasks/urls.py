from django.urls import path

from .views import TaskListView, TaskDetailView,RegisterView


urlpatterns = [
    path("tasks/", TaskListView.as_view()),
    path("tasks/<int:pk>/", TaskDetailView.as_view()),
    path("register/", RegisterView.as_view()),
]