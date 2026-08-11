from django.db import models

# Create your models here.
class Task(models.Model):

    class Status(models.TextChoices):
        TODO= "TODO", "To Do"
        IN_PROGRESS="IN_PROGRESS","In Progress"
        COMPLETED= "COMPLETED","Completed"

    class Priority(models.TextChoices):
        LOW="LOW","Low"
        MEDIUM="MEDIUM","Medium"
        HIGH="HIGH","High"

    title=models.CharField(max_length=200)
    description=models.TextField(blank=True)

    status=models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.TODO,
    )

    priority= models.CharField(
        max_length=20,
        choices=Priority.choices,
        default=Priority.MEDIUM,
    )

    due_date=models.DateField(null=True,blank=True)

    created_at=models.DateTimeField(auto_now_add=True)
    updated_at=models.DateTimeField(auto_now=True)
    