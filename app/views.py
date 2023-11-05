from django.shortcuts import render


def classes(request):
    return render(request, 'app/classes.html')


def create_class(request):
    return render(request, 'app/create_class.html')