from django.shortcuts import render, HttpResponseRedirect
from .models import Template
from django.urls import reverse

def index(request):
    tmpls = Template.objects.all()

    return render(request, 'fabricCanvas/index.html', {'templates':tmpls})

def insert_tmpl(request):
    tnail = request.POST['thumbnail']
    data = request.POST['data']
    record = Template(thumbnail=tnail, data=data)
    record.save()

    return HttpResponseRedirect(reverse('fabric_canvas:index'))


