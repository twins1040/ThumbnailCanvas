from django.db import models

# Create your models here.
class Template(models.Model):
    thumbnail = models.ImageField()
    data = models.CharField(max_length=100000)

class Youtube(models.Model):
    id = models.CharField(max_length=32, primary_key=True)
    data = models.FileField()
