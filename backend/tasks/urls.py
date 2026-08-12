from django.urls import path

from .views import TaskListView, TaskDetailView,RegisterView,ForgetPasswordView,ResetPasswordView,VerifyEmailView


urlpatterns = [
    path("tasks/", TaskListView.as_view()),
    path("tasks/<int:pk>/", TaskDetailView.as_view()),
    path("register/", RegisterView.as_view()),
    path("forget-password/",ForgetPasswordView.as_view()),
    path("reset-password/", ResetPasswordView.as_view()),
    path("verify-email/<int:user_id>/<str:token>/",VerifyEmailView.as_view()),
]