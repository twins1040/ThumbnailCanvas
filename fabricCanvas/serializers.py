from django.contrib.auth.models import User
from rest_framework import serializers

from fabricCanvas.models import Template


class TemplateSerializer(serializers.HyperlinkedModelSerializer):
    owner = serializers.ReadOnlyField(source='owner.username')
    thumbnail = serializers.ReadOnlyField(source='thumbnail.url')
    data = serializers.HyperlinkedIdentityField(
        view_name='template-data')

    class Meta:
        model = Template
        fields = ('url', 'id', 'owner', 'thumbnail', 'data')

class UserSerializer(serializers.HyperlinkedModelSerializer):
    templates = serializers.HyperlinkedRelatedField(
        many=True,
        view_name='template-detail',
        read_only=True)

    class Meta:
        model = User
        fields = ('url', 'id', 'username', 'email', 'is_authenticated', 'templates')
