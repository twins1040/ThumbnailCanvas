from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Template(models.Model):
    owner = models.ForeignKey(User, on_delete=models.CASCADE, null=True)
    thumbnail = models.ImageField()
    data = models.CharField(max_length=100000)
