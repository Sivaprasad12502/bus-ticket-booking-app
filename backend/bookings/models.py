from django.db import models
from django.conf import settings
from django.db.models.signals import post_save
from django.dispatch import receiver
from datetime import date,time


# Create your models here.
class Bus(models.Model):
    bus_name = models.CharField(max_length=100)
    total_seats = models.IntegerField()
    bus_type = models.CharField(
        max_length=50,
        choices=[("AC", "AC"), ("Non-AC", "Non-AC"), ("Sleeper", "sleeper")],
    )
    operator_name = models.CharField(max_length=100)
    layout_type = models.CharField(
        max_length=20,
        choices=[
            ("2*2", "2*2 Seating"),
            ("1*2", "1*2 seating"),
            ("Sleeper", "Sleeper Layout"),
        ],
    )
    operator_mobile = models.CharField(max_length=15, blank=True, null=True)

    def __str__(self):
        return f"{self.bus_name} {self.bus_type}"


class Route(models.Model):
    start_location = models.CharField(max_length=100)
    end_location = models.CharField(max_length=100)
    distance_km = models.FloatField(blank=True, null=True)

    def __str__(self):
        return f"{self.start_location}"


class RouteStop(models.Model):
    route = models.ForeignKey(Route, on_delete=models.CASCADE, related_name="stops")
    stop_name = models.CharField(max_length=100)
    order = models.PositiveIntegerField(
        help_text="The order of this stop in the  route"
    )
    # arrival_time = models.TimeField(null=True, blank=True)
    # departure_time = models.TimeField(null=True, blank=True)
    distance_from_start = models.FloatField(
        help_text="Distance in km from start", null=True, blank=True
    )
    # fare_from_start = models.DecimalField(
    #     max_digits=8, decimal_places=2, null=True, blank=True
    # )

    class Meta:
        ordering = ["order"]

    def __str__(self):
        return f"{self.route.start_location} -> {self.stop_name}"


class Trip(models.Model):
    bus = models.ForeignKey(Bus, on_delete=models.CASCADE)
    route = models.ForeignKey(Route, on_delete=models.CASCADE)
    departure_time = models.TimeField()
    arrival_time = models.TimeField()
    price = models.DecimalField(max_digits=8, decimal_places=2)
    
    def __str__(self):
        return f"{self.bus.bus_name} -> {self.route.start_location} to {self.route.end_location} {self.departure_time} -> {self.arrival_time}"


class TripStop(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name="trip_stops")
    route_stop = models.ForeignKey(RouteStop, on_delete=models.CASCADE)
    arrival_time = models.TimeField(default=time(0,0))
    fare_from_start=models.DecimalField(max_digits=8,decimal_places=2,null=True,blank=True)
    class Meta:
        ordering = ["route_stop__order"]

    def __str__(self):
        return f"{self.trip.bus.bus_name}->{self.route_stop.stop_name}"


class Seat(models.Model):
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name="seats")
    seat_number = models.CharField(max_length=5)
    gender_preference=models.CharField(
        max_length=10,choices=[("ANY","Any"),("WOMEN_ONLY","Women only")],default="ANY"
    )
    # is_booked = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.trip.bus.bus_name} Seat {self.seat_number}"


class Booking(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE)
    seats = models.ManyToManyField(Seat, blank=True)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)
    booking_date = models.DateTimeField(auto_now_add=True)
    # Use today's date as default when a booking date is not provided
    booked_date = models.DateField(default=date.today)
    payment_deadline = models.DateTimeField(null=True, blank=True)
    status = models.CharField(
        max_length=20,
        choices=[
            ("PENDING_PAYMENT", "Pending Payment"),
            ("CONFIRMED", "confirmed"),
            ("CANCELLED", "Cancelled"),
            ("EXPIRED", "Expired"),
        ],
        default="PENDING_PAYMENT",
    )

    def __str__(self):
        return f"{self.user.username} -{self.trip} ({self.status})"


class Passenger(models.Model):
    booking = models.ForeignKey(
        Booking, on_delete=models.CASCADE, related_name="passengers"
    )
    name = models.CharField(max_length=100)
    age = models.IntegerField()
    gender = models.CharField(
        max_length=10, choices=[("M", "Male"), ("F", "Female"), ("O", "Other")]
    )
    boarding_location = models.CharField(max_length=100)
    dropping_location = models.CharField(max_length=100)
    seat_number = models.CharField(max_length=5, blank=True)
    fare = models.DecimalField(max_digits=8, decimal_places=2, default=0.0)

    def __str__(self):
        return f"{self.name} ({self.seat_number})"


class Payment(models.Model):
    booking = models.OneToOneField(
        Booking, on_delete=models.CASCADE, related_name="payments"
    )
    stripe_payment_intent_id = models.CharField(max_length=200, blank=True, null=True)
    stripe_payment_method = models.CharField(max_length=100, blank=True, null=True)
    refund_id = models.CharField(max_length=255, blank=True, null=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    currency = models.CharField(max_length=10, default="inr")
    payment_status = models.CharField(
        max_length=20,
        choices=[("PENDING", "Pending"), ("SUCCESS", "Success"), ("FAILED", "Failed")],
        default="PENDING",
    )
    receipt_url = models.URLField(blank=True, null=True)
    payment_date = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.booking.user.username} - {self.payment_status}"


@receiver(post_save, sender=Trip)
def create_seats_for_trip(sender, instance, created, **kwargs):
    if created:
        total_seats = instance.bus.total_seats
        for i in range(1, total_seats + 1):
            Seat.objects.create(trip=instance, seat_number=str(i))

# @receiver(post_save, sender=Trip)
# def calculate_stop_fares(sender, instance, created, **kwargs):
#     """
#     Automatically calculate fare_from_start for each stop
#     based on total trip price and distance proportion.
#     """
#     if not created:
#         return

#     route_stops = list(
#         RouteStop.objects.filter(route=instance.route).order_by("order")
#     )
#     if len(route_stops) < 2:
#         return

#     total_distance = route_stops[-1].distance_from_start or 0
#     if total_distance == 0:
#         return

#     for rs in route_stops:
#         proportion = (rs.distance_from_start or 0) / total_distance
#         fare= round(float(instance.price) * proportion, 2)
#         TripStop.objects.create(
#             trip=instance,
#             route_stop=rs,
#             fare_from_start=fare
#         )
