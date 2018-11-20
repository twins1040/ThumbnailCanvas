from django.shortcuts import render, HttpResponseRedirect, get_object_or_404
from django.http import HttpResponse
from .models import Template
from django.contrib.auth.models import User
from django.urls import reverse

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


def index(request):
    tmpls = Template.objects.all()
    user_tmpls = {}
    if request.user.is_authenticated:
        try:
            _tnail = request.session['thumbnail']
            data = request.session['canvas_data']
            save_tmpl(_tnail, data, request.user)
            del request.session['thumbnail']
            del request.session['canvas_data']
        except KeyError:
            pass

        user = User.objects.get(pk=request.user.id)
        user_tmpls = user.template_set.all()

    return render(request, 'fabricCanvas/index.html',
            {'templates':tmpls,
             'user_templates':user_tmpls})

def insert_tmpl(request):
    if not request.user.is_authenticated:
        request.session['thumbnail'] = request.POST['thumbnail']
        request.session['canvas_data'] = request.POST['data']
        return HttpResponseRedirect(reverse('social:begin', args=['google-oauth2']))
    else:
        _tnail = request.POST['thumbnail']
        data = request.POST['data']

        save_tmpl(_tnail, data, request.user)

        return HttpResponseRedirect(reverse('fabric_canvas:index'))

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
