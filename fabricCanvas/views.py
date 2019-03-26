from django.contrib.auth.models import User
from rest_framework import generics, permissions, renderers, viewsets, status
from rest_framework.decorators import detail_route
from rest_framework.response import Response

from fabricCanvas.models import Template
from fabricCanvas.serializers import TemplateSerializer, UserSerializer
from fabricCanvas.permissions import IsOwnerOrReadOnly, IsSameUser

from django.core.files.base import ContentFile
import base64

def base64_to_image(data, name):
    s = data.split(';base64,')
    if len(s) < 2:
        raise AttributeError("no base64")
    format, imgstr = s
    ext = format.split('/')[-1]
    return ContentFile(base64.b64decode(imgstr), name=name+'.'+ext)

class TemplateViewSet(viewsets.ModelViewSet):
    queryset = Template.objects.all()
    serializer_class = TemplateSerializer
    # Error if any permission check fails
    permission_classes = (IsOwnerOrReadOnly, )

    @detail_route()
    def data(self, request, *args, **kwargs):
        template = self.get_object()
        return Response(template.data)

    def create(self, request, *args, **kwargs):
        # If base64 image, convet to blob
        try:
            rd = request.data;
            rd['thumbnail'] = base64_to_image(rd['thumbnail'], "thumbnail")
        except:
            pass

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = (IsSameUser, )
