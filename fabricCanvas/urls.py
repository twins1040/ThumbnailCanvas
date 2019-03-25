from django.urls import path, include
from rest_framework.routers import DefaultRouter

from fabricCanvas import views


router = DefaultRouter()
router.register(r'templates', views.TemplateViewSet)
router.register(r'users', views.UserViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('login/', include('rest_social_auth.urls_token')),
]
