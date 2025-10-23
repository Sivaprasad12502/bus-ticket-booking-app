from django.urls import path
from . import views

urlpatterns = [
    path("buses/", views.bus_list, name="bus-list"),
    path("buses/<int:pk>", views.bus_detail, name="bus-detail"),
    path("routes/", views.route_list, name="route-list"),
    path("routes/<int:pk>/", views.route_detail, name="route-detail"),
    path("trips/", views.trip_list, name="trip-list"),
    path("trips/<int:pk>/", views.trip_detail, name="trip-detail"),
    path(
        "trips/<int:trip_id>/seats/",
        views.trip_available_seats,
        name="trip-available-seats",
    ),
    path("bookings/", views.create_bookings, name="create-booking"),
    path(
        "bookings/<int:booking_id>/passengers/",
        views.add_passengers,
        name="add-passengers",
    ),
    # path('bookings/<int:booking_id>/payment/',views.create_payment,name='payement'),
    path(
        "bookings/<int:booking_Id>/create-payment-intent/",
        views.create_payment_intent,
        name="create-payment-intent",
    ),
    path(
        "bookings/<int:booking_Id>/confirm-payment/",
        views.confirm_payment,
        name="confirm-payment",
    ),
    path(
        "bookings/<int:booking_Id>/cancel/",
        views.cancel_bookings,
        name="cancel_bookings",
    ),
]
