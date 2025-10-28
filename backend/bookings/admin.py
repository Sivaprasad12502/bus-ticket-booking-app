from django.contrib import admin
from .models import Bus,Route,Trip,Seat,Booking,Passenger,Payment,RouteStop,TripStop
models_list=[Bus,Route,Trip,Seat,Booking,Passenger,Payment,RouteStop,TripStop]
# Register your models here.
admin.site.register(models_list)
