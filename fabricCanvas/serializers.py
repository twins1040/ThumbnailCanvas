from django.contrib.auth.models import User
from rest_framework import serializers

from fabricCanvas.models import Template


class TemplateSerializer(serializers.HyperlinkedModelSerializer):
    owner_id = serializers.ReadOnlyField(source='owner.id')
    owner_name = serializers.ReadOnlyField(source='owner.username')
    thumbnail = serializers.ImageField(use_url=True)
    data = serializers.CharField(write_only=True)

    class Meta:
        model = Template
        fields = ('url', 'id', 'owner_id', 'owner_name', 'thumbnail', 'data')

class UserSerializer(serializers.HyperlinkedModelSerializer):
    templates = TemplateSerializer(
        many=True,
        read_only=True)

    class Meta:
        model = User
        fields = ('url', 'id', 'username', 'email', 'is_superuser', 'templates')
