# Generated by Django 2.1.3 on 2018-11-11 13:33

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('fabricCanvas', '0002_template_owner'),
    ]

    operations = [
        migrations.AlterField(
            model_name='template',
            name='owner',
            field=models.ForeignKey(null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL),
        ),
    ]
