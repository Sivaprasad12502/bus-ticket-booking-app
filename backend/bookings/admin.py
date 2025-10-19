from django.contrib import admin
from .models import Bus,Route,Trip,Seat,Booking,Passenger,Payment
models_list=[Bus,Route,Trip,Seat,Booking,Passenger,Payment]
# Register your models here.
admin.site.register(models_list)
