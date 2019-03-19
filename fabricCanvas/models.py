from django.db import models
from django.contrib.auth.models import User
from django.dispatch import receiver
import os

# Create your models here.
class Template(models.Model):
    owner = models.ForeignKey(User, related_name='templates', on_delete=models.CASCADE, null=True)
    thumbnail = models.ImageField(upload_to="templates")
    data = models.TextField()

@receiver(models.signals.post_delete, sender=Template)
def auto_delete_file_on_delete(sender, instance, **kwargs):
    """
    Deletes file from filesystem
    when corresponding `MediaFile` object is deleted.
    """
    if instance.thumbnail:
        if os.path.isfile(instance.thumbnail.path):
            os.remove(instance.thumbnail.path)

