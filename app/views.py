from django.shortcuts import render

from utils import decorators

from app import models

import time


@decorators.logged_in
def classes(request):
    games = models.Game.objects.filter(user=request.user).order_by('-last_activity_timestamp')

    print(games)

    return render(request, 'app/classes.html', {'games' : games})


@decorators.logged_in
def create_class(request):
    if request.method == 'POST':
        name = request.POST.get('name')

        models.Game.objects.create(
            user=request.user,
            name=name,
            last_activity_timestamp=time.time(),
            creation_timestamp=time.time()
        )
    
    return render(request, 'app/create_class.html')


def dev(request):
    for object in models.Game.objects.all():
        object.delete()

    return render(request, 'app/create_class.html') 