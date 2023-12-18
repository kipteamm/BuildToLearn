from django.urls import path

from .views import *


urlpatterns = [
    path('classes', classes, name='classes'),
    path('classes/create', create_class, name='create_class'),

    path('dev', dev, name='app_test')
]