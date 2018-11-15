from django.urls import path

from . import views

app_name = 'fabric_canvas'
urlpatterns = [
    path('', views.index, name='index'),
    path('templates/', views.insert_tmpl, name='insert_tmpl'),
    path('templates/<int:template_id>/data/', views.template_data, name='template_data'),
    path('templates/<int:template_id>/thumbnail/', views.template_thumbnail, name='template_thumbnail'),
]
