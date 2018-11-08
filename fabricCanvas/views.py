from django.shortcuts import render, HttpResponseRedirect
from .models import Template
from django.urls import reverse
from django.http import Http404, HttpResponse
from pytube import YouTube

def index(request):
    tmpls = Template.objects.all()

    return render(request, 'fabricCanvas/index.html', {'templates':tmpls})

def insert_tmpl(request):
    tnail = request.POST['thumbnail']
    data = request.POST['data']
    record = Template(thumbnail=tnail, data=data)
    record.save()

    return HttpResponseRedirect(reverse('fabric_canvas:index'))

def media_tunnel(request):
    if request.method == POST:
        # download youtube
        yt = YouTube('/'+request.mid)
        yt = yt.streams.first().download()
        # save youtube
        return HttpResponse("request success")
    else:
        return Http404("POST is required")


