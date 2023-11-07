from django.shortcuts import render

from app import models


def classes(request):
    classes = models.Game.objects.filter(user=user)

    return render(request, 'app/classes.html')


def create_class(request):
    if request.method == 'POST':
        name = request.POST.get('name')

        theme = request.POST.get('theme')

        resource_1 = request.POST.get('resource_1')
        resource_2 = request.POST.get('resource_2')
        resource_3 = request.POST.get('resource_3')

        models.Game.objects.create(
            user=user,
            name=name,
            theme=theme.lower(),
            resource_1=resource_1,
            resource_2=resource_2,
            resource_3=resource_3
        )
    
    return render(request, 'app/create_class.html')