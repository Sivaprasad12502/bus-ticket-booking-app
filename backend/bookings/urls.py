from django.urls import path
from . import views
from . import admin_views ,operator_views

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
        "bookings/create-payment-intent/",
        views.create_payment_intent,
        name="create-payment-intent",
    ),
    path(
        "bookings/confirm-payment/",
        views.confirm_payment,
        name="confirm-payment",
    ),
    path(
        "bookings/<int:booking_Id>/cancel/",
        views.cancel_bookings,
        name="cancel_bookings",
    ),
    # ===ADMIN PANEL API ROUTES===#
    path("admin/users/", admin_views.admin_users_list, name="admin_users_list"),
    path(
        "admin/<int:user_id>/toggle-status/",
        admin_views.admin_toggle_user_status,
        name="admin_toggle_user_status",
    ),
    path(
        "admin/dashboard/",
        admin_views.admin_dashboard_status,
        name="admin_dashboard_status",
    ),
    path("admin/buses/", admin_views.admin_bus_list, name="admin_bus_list"),
    path(
        "admin/buses/<int:pk>/", admin_views.admin_bus_detail, name="admin_bus_detail"
    ),
    path("admin/routes/", admin_views.admin_route_list, name="admin_route_list"),
    path(
        "admin/routes/<int:pk>/",
        admin_views.admin_route_detail,
        name="admin_route_detail",
    ),
    path(
        "admin/routes/<int:pk>/stops/",
        admin_views.admin_routestop_list,
        name="admin_route_stop_list",
    ),
    path(
        "admin/routestops/<int:pk>/",
        admin_views.admin_routestop_detail,
        name="admin_route_stop_detail",
    ),
    path("admin/trips/", admin_views.admin_trip_list, name="admin_trip_list"),
    path(
        "admin/trips/<int:pk>/", admin_views.admin_trip_detail, name="admin_trip_detail"
    ),
    path(
        "admin/trips/<int:pk>/tripstops/",
        admin_views.admin_tripstop_list,
        name="admin_tripstop_list",
    ),
    path(
        "admin/tripstops/<int:pk>/",
        admin_views.admin_tripstop_detail,
        name="admin_tripstop_detail",
    ),
    path(
        "admin/trips/<int:trip_id>/seats/",
        admin_views.admin_trip_seats,
        name="admin_trip_seats",
    ),
    path(
        "admin/seats/<int:seat_id>/",
        admin_views.update_seat_gender_preference,
        name="update_seat_gender_preference",
    ),
    path("admin/bookings/", admin_views.admin_all_bookings, name="admin_all_bookings"),
    path(
        "admin/bookings/<int:booking_id>/",
        admin_views.admin_delete_booking,
        name="admin_delete_booking",
    ),
    path("admin/payments/", admin_views.admin_all_payments, name="admin_all_payments"),
    # path to operator to manage their trips
    path("operator/<int:operator_id>/trips/",operator_views.operator_manage_trip,name="operator_manage_trip"),
]
