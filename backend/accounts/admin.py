from django.contrib import admin
from django.contrib.admin.sites import AlreadyRegistered
from .models import *

# Register all models in the accounts app
def get_models():
    from django.apps import apps
    return apps.get_app_config('accounts').get_models()

for model in get_models():
    try:
        admin.site.register(model)
    except AlreadyRegistered:
        pass
