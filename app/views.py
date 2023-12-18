from django.shortcuts import render, redirect

from utils import decorators

from app import models

import time


@decorators.logged_in
def games(request):
    games = models.Game.objects.filter(user=request.user).order_by('-last_activity_timestamp')

    print(games)

    return render(request, 'app/classes.html', {'games' : games})


@decorators.logged_in
def create_game(request):
    if request.method == 'POST':
        name = request.POST.get('name')

        models.Game.objects.create(
            user=request.user,
            name=name,
            last_activity_timestamp=time.time(),
            creation_timestamp=time.time()
        )
    
    return render(request, 'app/create_class.html')


@decorators.logged_in
def game(request, id):
    game = models.Game.objects.filter(id=id)

    if not game.exists():
        return redirect('/classes')
    
    return render(request, 'app/class.html', {'game' : game.first()})


def dev(request):
    for object in models.Game.objects.all():
        object.delete()

    return render(request, 'app/create_class.html') 