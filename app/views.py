from django.shortcuts import render

from utils import decorators

from app import models

import time


@decorators.logged_in
def classes(request):
    games = models.Game.objects.filter(user=request.user).order_by('-last_activity_timestamp')

    return render(request, 'app/classes.html', {'games' : games})


@decorators.logged_in
def create_class(request):
    if request.method == 'POST':
        name = request.POST.get('name')

        theme = request.POST.get('theme')

        resource_1 = request.POST.get('resource_1')
        resource_2 = request.POST.get('resource_2')
        resource_3 = request.POST.get('resource_3')

        models.Game.objects.create(
            user=request.user,
            name=name,
            theme=theme.lower(),
            resource_1=resource_1,
            resource_2=resource_2,
            resource_3=resource_3,
            last_activity_timestamp=time.time(),
            creation_timestamp=time.time()
        )
    
    return render(request, 'app/create_class.html')


def app_test(request):
    for object in models.Game.objects.all():
        object.delete()

    return render(request, 'app/create_class.html') 