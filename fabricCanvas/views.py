from django.shortcuts import render, HttpResponseRedirect, get_object_or_404
from django.http import HttpResponse
from .models import Template
from django.contrib.auth.models import User
from django.urls import reverse

def index(request):
    tmpls = Template.objects.all()
    user_tmpls = {}
    if request.user.is_authenticated:
        user = User.objects.get(pk=request.user.id)
        user_tmpls = user.template_set.all()


    return render(request, 'fabricCanvas/index.html',
            {'templates':tmpls,
             'user_templates':user_tmpls})

def insert_tmpl(request):
    if not request.user.is_authenticated:
        return HttpResponseRedirect(reverse('social:begin', args=['google-oauth2']))
    else:
        tnail = request.POST['thumbnail']
        data = request.POST['data']
        record = Template(thumbnail=tnail, data=data, owner=request.user)
        record.save()

        return HttpResponseRedirect(reverse('fabric_canvas:index'))

def template(request, template_id):
    tmpl = get_object_or_404(Template, pk=template_id)

    return HttpResponse(tmpl.data)

