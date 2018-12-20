from .base import *

# Load secret settings for production
with open(os.path.join(BASE_DIR, 'server.json')) as f:
    data = json.load(f)

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = data["secret_key"]

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

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


# Database
# https://docs.djangoproject.com/en/2.0/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}


