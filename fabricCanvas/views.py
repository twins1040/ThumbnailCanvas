from django.contrib.auth.models import User
from rest_framework import generics, permissions, renderers, viewsets
from rest_framework.decorators import detail_route
from rest_framework.response import Response
from fabricCanvas.models import Template
from fabricCanvas.serializers import TemplateSerializer, UserSerializer

from django.shortcuts import render, HttpResponseRedirect, get_object_or_404
from django.http import HttpResponse, JsonResponse
from django.urls import reverse
from django.views.decorators.cache import cache_control, never_cache

from django.core.files.base import ContentFile
import base64

def base64_to_image(data, name):
    s = data.split(';base64,')
    if len(s) < 2:
        raise AttributeError("no base64")
    format, imgstr = s
    ext = format.split('/')[-1]
    return ContentFile(base64.b64decode(imgstr), name=name+'.'+ext)

def save_tmpl(_tnail, data, user):
    try:
        tnail = base64_to_image(_tnail, "thumbnail")
    except AttributeError:
        pass

    record = Template(thumbnail=tnail, data=data, owner=user)
    record.save()

@never_cache
def session(request):
    if request.method == 'POST':
        request.session['canvas_data'] = request.POST['data']
        request.session['page'] = request.POST['page']
        request.session.set_expiry(300)
        return HttpResponse('session saved')

    if request.method == 'GET':
        data = {}
        try:
            data = {
                "data" : request.session['canvas_data'],
                "page" : request.session['page'],
            }
        except KeyError:
            pass
        return JsonResponse(data)

@cache_control(no_cache=True)
def hot_templates(request):
    if request.method == 'GET':
        hot_tmpls = []
        # Collect id, url. Can't find how to do not use forloop
        # Loop is essential for using property like .url
        hot_tmpls_query = Template.objects.only('id', 'thumbnail')
        for q in hot_tmpls_query:
            hot_tmpls.append({'id' : q.id, 'thumbnail' : q.thumbnail.url})
        return JsonResponse(hot_tmpls, safe=False)
    return HttpResponse(status=405)

@cache_control(no_cache=True)
def user_templates(request):
    if not request.user.is_authenticated:
        return HttpResponse(status=401)

    if request.method == 'POST':
        _tnail = request.POST['thumbnail']
        data = request.POST['data']
        save_tmpl(_tnail, data, request.user)
        return HttpResponseRedirect(reverse('index'))

    elif request.method == 'GET':
        user_tmpls = []
        # Collect id, url. Can't find how to do not use forloop
        # Loop is essential for using property like .url
        if request.user.is_authenticated:
            user = User.objects.get(pk=request.user.id)
            user_tmpls_query = user.template_set.only('id', 'thumbnail')
            for q in user_tmpls_query:
                user_tmpls.append({'id' : q.id, 'url' : q.thumbnail.url})
        # Integrate both hot, user templates
        return JsonResponse(user_tmpls, safe=False)

    return HttpResponse(status=405)

@never_cache
def tmpl(request, template_id):
    if request.method == 'DELETE':
        if not request.user.has_perm('fabricCanvas.delete_template'):
            return HttpResponse(status=401)
        tmpl = get_object_or_404(Template, pk=template_id)
        tmpl.delete()
        return HttpResponse("delete success")
    else:
        return HttpResponse(status=400)

def template_data(request, template_id):
    tmpl = get_object_or_404(Template, pk=template_id)
    return HttpResponse(tmpl.data)

def template_thumbnail(request, template_id):
    tmpl = get_object_or_404(Template, pk=template_id)
    name = tmpl.thumbnail.name

    try:
        bimage = base64_to_image(name, "thumbnail")
        tmpl.thumbnail = bimage
        tmpl.save()
        print("base image is decoded!!")
    except AttributeError:
        pass

    return HttpResponse(tmpl.thumbnail.url)

def my_user(request):
    if request.method == 'GET':
        return JsonResponse({
            'login' : request.user.is_authenticated,
            'super' : request.user.is_superuser,
        })
    else:
        return HttpResponse(status=400)

class TemplateViewSet(viewsets.ModelViewSet):
    queryset = Template.objects.all()
    serializer_class = TemplateSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    @detail_route()
    def data(self, request, *args, **kwargs):
        template = self.get_object()
        return Response(template.data)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
