from django.urls import path

from . import views

app_name = 'fabric_canvas'
urlpatterns = [
    path('templates/', views.templates, name='templates'),
    path('templates/<int:template_id>/', views.tmpl, name='tmpl'),
    path('templates/<int:template_id>/data/', views.template_data, name='template_data'),
    path('templates/<int:template_id>/thumbnail/', views.template_thumbnail, name='template_thumbnail'),
    path('session/', views.session, name='fabric_session'),
    path('user/', views.my_user, name='my_user'),
]
