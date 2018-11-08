from django.urls import path

from . import views

app_name = 'fabric_canvas'
urlpatterns = [
    path('', views.index, name='index'),
    path('templates/', views.insert_tmpl, name='insert_tmpl'),
    path('tunnel/', views.media_tunnel, name='media_tunnel'),
    path('tunnel/<mid>', views.media, name='media'),
]
