# Generated by Django 2.1.2 on 2018-11-15 14:50

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('fabricCanvas', '0003_auto_20181111_1333'),
    ]

    operations = [
        migrations.AlterField(
            model_name='template',
            name='thumbnail',
            field=models.ImageField(upload_to='templates'),
        ),
    ]
