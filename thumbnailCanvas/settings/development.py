from .base import *

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'f81(k3s572%o-_%x(t%nfjqt&=4m81*fz%y7#rib8=lqkfz34$'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = [
    '127.0.0.1',
]

"""
ALLOWED_HOSTS = [
    '175.113.156.193',
    '192.168.25.50',
    '13.209.162.217',
    'youtube-thumbnail-maker.tk',
    'youtube-thumbnail-maker.ga',
    'www.thumbnail-maker.ga',
    'thumbnail-maker.ga',
    'www.thumbnail-maker.xyz',
    'thumbnail-maker.xyz',
]


"""
# Database
# https://docs.djangoproject.com/en/2.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}


