#!/usr/bin/env python
import os
import sys

if __name__ == "__main__":
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "thumbnailCanvas.settings.development")
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc

    # Static file will serve with never_cache
    # See project/urls.py
    if '--nostatic' not in sys.argv:
            sys.argv.append('--nostatic')

    execute_from_command_line(sys.argv)
