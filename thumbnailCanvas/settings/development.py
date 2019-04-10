from .base import *

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'f81(k3s572%o-_%x(t%nfjqt&=4m81*fz%y7#rib8=lqkfz34$'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = [
    'localhost',
    '10.193.6.51',
]

# CORS allow
CORS_ORIGIN_WHITELIST = (
    'localhost:8000',
    'localhost:8080',
    '10.193.6.51:8080',
)

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}
