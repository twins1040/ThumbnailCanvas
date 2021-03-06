from django.contrib import admin
from django.contrib.auth.views import logout_then_login
from django.conf import settings
from django.urls import path, include
from django.http import HttpResponse
import subprocess
from django.conf.urls.static import static
from django.contrib.staticfiles.views import serve as serve_static
from django.views.decorators.cache import never_cache

def webHook(request):
    subprocess.run('/home/ubuntu/ThumbnailCanvas/webHook.sh', shell=True)
    return HttpResponse("deployed ")

urlpatterns = [
    path('', serve_static, kwargs={'path': 'bypass/index.html'}, name='index'),
    path('api/', include('fabricCanvas.urls')),
    path('admin/', admin.site.urls),
    path('payload/', webHook),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Never Cache
# Check manage.py, it should run with --nostatic
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, view=never_cache(serve_static))
