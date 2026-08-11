from django.urls import path

from .views import TaskListView, TaskDetailView,RegisterView,ForgetPasswordView,ResetPasswordView


urlpatterns = [
    path("tasks/", TaskListView.as_view()),
    path("tasks/<int:pk>/", TaskDetailView.as_view()),
    path("register/", RegisterView.as_view()),
    path("forget-password/",ForgetPasswordView.as_view()),
]