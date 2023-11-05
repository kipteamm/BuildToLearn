from django.shortcuts import render, redirect, HttpResponse
from django.contrib import messages

from authentication import models

from utils import functions 

import time


def register(request):
    if request.method == "POST":
        email_address = request.POST.get('email_address')

        if models.User.objects.filter(email_address__iexact=email_address).exists():
            messages.error(request, "This email address is already in use.")

            return redirect('register')

        password = request.POST.get('password')

        if len(password) < 8:
            messages.error(request, "Your password needs to be atleast 8 characters.")

            return redirect('register')

        salt = functions.random_string(64)

        models.User.objects.create(
            email_address=email_address,
            password=functions.sha256(f"{salt}${password}"),
            salt=salt,
            creation_timestamp=time.time()
        )

        messages.success(request, "Account successfully created")

        return redirect('/login')

    return render(request, 'auth/register.html')


def login(request):
    if request.method == "POST":
        email_address = request.POST.get('email_address')
        password = request.POST.get('password')

        user = models.User.objects.filter(email_address__iexact=email_address)

        if not user.exists():
            messages.error(request, "There is no account with this email registered.")

            return render(request, 'auth/login.html')
        
        user = user.first()

        if functions.path_exists(request.GET.get('next')):
            next_page = request.GET.get('next')
        else:
            next_page = '/classes'

        if functions.sha256(f"{user.salt}${password}") != user.password: # type: ignore
            messages.error(request, "Invalid password")

            if next_page != '/classes':
                return redirect(f'/login?next={next_page}')
        
            return redirect('/login')
        
        user.token = functions.sha256(f"token${time.time()}") # type: ignore
        user.save() # type: ignore
        
        messages.success(request, "Logged in")

        response = redirect(next_page)
        response.set_cookie('au_id', user.token) # type: ignore

        return response
    
    return render(request, 'auth/login.html')


def test(request):
    return HttpResponse('success')