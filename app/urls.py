from django.urls import path

from .views import *


urlpatterns = [
    path('classes', games, name='games'),
    path('classes/create', create_game, name='create_game'),

    path('class/<str:id>', game, name='game'),

    path('dev', dev, name='app_test')
]