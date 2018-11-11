from django.shortcuts import render, HttpResponseRedirect
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
    tnail = request.POST['thumbnail']
    data = request.POST['data']
    record = Template(thumbnail=tnail, data=data, owner=request.user)
    record.save()

    return HttpResponseRedirect(reverse('fabric_canvas:index'))


