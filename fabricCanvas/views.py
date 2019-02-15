from django.shortcuts import render, HttpResponseRedirect, get_object_or_404
from django.http import HttpResponse, JsonResponse
from .models import Template
from django.contrib.auth.models import User
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
        print(request.POST['box_info'])
        request.session['canvas_data'] = request.POST['data']
        request.session['box_info'] = request.POST['box_info']
        request.session.set_expiry(300)
        return HttpResponse('session saved')

    if request.method == 'GET':
        data = "";
        try:
            data += '{"cdata":'+request.session['canvas_data']+','
            data += '"box_info":'+request.session['box_info']+'}'
        except KeyError:
            pass
        return HttpResponse(data)

@cache_control(no_cache=True)
def templates(request):
    if request.method == 'POST':
        if not request.user.is_authenticated:
            request.session['canvas_data'] = request.POST['data']
            request.session.set_expiry(300)
            return HttpResponseRedirect(reverse('social:begin', args=['google-oauth2']))
        else:
            _tnail = request.POST['thumbnail']
            data = request.POST['data']
            save_tmpl(_tnail, data, request.user)
            return HttpResponseRedirect(reverse('fabric_canvas:index'))

    elif request.method == 'GET':
        hot_tmpls = []
        user_tmpls = []
        # Collect id, url. Can't find how to do not use forloop
        # Loop is essential for using property like .url
        hot_tmpls_query = Template.objects.only('id', 'thumbnail')
        for q in hot_tmpls_query:
            hot_tmpls.append({'id' : q.id, 'url' : q.thumbnail.url})
        # Append user's templates if logged in
        if request.user.is_authenticated:
            user = User.objects.get(pk=request.user.id)
            user_tmpls_query = user.template_set.only('id', 'thumbnail')
            for q in user_tmpls_query:
                user_tmpls.append({'id' : q.id, 'url' : q.thumbnail.url})
        # Integrate both hot, user templates
        response_tmpls = {'hot_templates':hot_tmpls, 'user_templates':user_tmpls}
        return JsonResponse(response_tmpls)

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
