from django.urls import path

from . import views

app_name = 'fabric_canvas'
urlpatterns = [
    path('', views.index, name='index'),
    path('templates/', views.insert_tmpl, name='insert_tmpl'),
]
