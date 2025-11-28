from django.shortcuts import render
from users.models import User
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from django.db.models import Count, Sum, Q, Avg
from django.utils import timezone
from datetime import datetime, time, timedelta
from .models import (
    Bus,
    Route,
    Trip,
    Seat,
    Booking,
    Passenger,
    Payment,
    RouteStop,
    TripStop,
)
from .serializers import (
    BusSerializer,
    RouteSerializer,
    TripSerializer,
    SeatSerializer,
    PassengerSerializer,
    PaymentSerializer,
    BookingSerializer,
    RouteStopSerializer,
    TripStopSerializer,
)
from django.db.models import Q
import traceback


# DASHBOARD VIEWS
@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_dashboard_status(request):
    """'
    Get Dahboard statistics for admin panel
    """
    try:
        # date filters
        today = timezone.now().date()
        last_7_days = today - timedelta(days=7)
        last_30_days = today - timedelta(days=30)
        # Tatal Counts
        total_buses = Bus.objects.count()
        total_routes = Route.objects.count()
        total_users = User.objects.filter(is_staff=False).count()

        # Booking statistics
        total_bookings = Booking.objects.count()
        confiremed_bookings = Booking.objects.filter(status="CONFIRMED").count()
        pending_bookings = Booking.objects.filter(status="PENDING").count()
        cancelled_bookings = Booking.objects.filter(status="CANCELLED").count()
        # Revenue statistics
        total_revenue = (
            Payment.objects.filter(payment_status="SUCCESS").aggregate(
                total=Sum("amount")
            )["total"]
            or 0
        )
        monthly_revenue = (
            Payment.objects.filter(
                payment_status="SUCCESS", payment_date__gte=last_30_days
            ).aggregate(total=Sum("amount"))["total"]
            or 0
        )
        weekly_revenue = (
            Payment.objects.filter(
                payment_status="SUCCESS", payment_date__gte=last_7_days
            ).aggregate(total=Sum("amount"))["total"]
            or 0
        )

        # Recent bookings (last 5)
        recent_bookings = Booking.objects.select_related(
            "trip__route", "trip__bus", "user"
        ).order_by("-booking_date")[:5]
        recent_bookings_data = []
        for booking in recent_bookings:
            recent_bookings_data.append(
                {
                    "id": booking.id,
                    "route": f"{booking.trip.route.start_location}->{booking.trip.route.end_location}",
                    "passenger": booking.user.get_full_name() or booking.user.username,
                    "amount": float(booking.total_amount),
                    "status": booking.status,
                    "date": booking.booked_date,
                }
            )
        # Top routes by bookings
        top_routes = Route.objects.annotate(
            booking_count=Count("trip__booking")
        ).order_by("-booking_count")[:5]
        top_routes_data = []
        for route in top_routes:
            top_routes_data.append(
                {
                    "id": route.id,
                    "route": f"{route.start_location}->{route.end_location}",
                    "bookings": route.booking_count,
                    "distance": route.distance_km,
                }
            )
        # calculate growth percentages
        prev_month_revenue = (
            Payment.objects.filter(
                payment_status="COMPLETED",
                payment_date__gte=last_30_days - timedelta(days=30),
                payment_date__lt=last_30_days,
            ).aggregate(total=Sum("amount"))["total"]
            or 1
        )
        revenue_growth = (
            ((monthly_revenue - prev_month_revenue) / prev_month_revenue * 100)
            if prev_month_revenue > 0
            else 0
        )
        prev_month_bookings = (
            Booking.objects.filter(
                booked_date__gte=last_30_days - timedelta(days=30),
                booked_date__lt=last_30_days,
            ).count()
            or 1
        )
        current_month_bookings = Booking.objects.filter(
            booked_date__gte=last_30_days
        ).count()
        booking_growth = (
            ((current_month_bookings - prev_month_bookings) / prev_month_bookings * 100)
            if prev_month_bookings > 0
            else 0
        )
        return Response(
            {
                "status": {
                    "total_buses": total_buses,
                    "total_bookings": total_bookings,
                    "total_users": total_users,
                    "total_revenue": float(total_revenue),
                    "confirmed_bookings": confiremed_bookings,
                    "pending_bookings": pending_bookings,
                    "cancelled_bookings": cancelled_bookings,
                    "monthly_revenue": float(monthly_revenue),
                    "weekly_revenue": float(weekly_revenue),
                    "revenue_growth": round(revenue_growth, 2),
                    "booking_growth": round(booking_growth, 2),
                },
                "recent_bookings": recent_bookings_data,
                "top_routes": top_routes_data,
            }
        )
    except Exception as e:
        print("=== ERROR in admin_dashboard_status ===")
        print(e)
        traceback.print_exc()
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# Bus management


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_bus_list(request):
    if request.method == "GET":
        buses = Bus.objects.all()
        serializer = BusSerializer(buses, many=True)
        return Response(serializer.data)
    elif request.method == "POST":
        serializer = BusSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_bus_detail(request, pk):
    try:
        bus = Bus.objects.get(pk=pk)
    except Bus.DoesNotExist:
        return Response({"error": "Bus not found"}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        serializer = BusSerializer(bus)
        return Response(serializer.data)
    elif request.method == "PUT":
        serializer = BusSerializer(bus, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == "DELETE":
        bus.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# admin Route management
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_route_list(request):
    if request.method == "GET":
        routes = Route.objects.all()
        serializer = RouteSerializer(routes, many=True)
        return Response(serializer.data)
    elif request.method == "POST":
        serializer = RouteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)


@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_route_detail(request, pk):
    try:
        route = Route.objects.get(pk=pk)
    except Route.DoesNotExist:
        return Response({"error": "Route not found"}, status=404)

    if request.method == "GET":
        serializer = RouteSerializer(route)
        return Response(serializer.data)
    elif request.method == "PUT":
        serializer = RouteSerializer(route, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    elif request.method == "DELETE":
        route.delete()
        return Response(status=204)


# Admin-RouteStop management
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_routestop_list(request, pk):
    """
    Admin RouteStop management
    """
    try:
        route = Route.objects.get(pk=pk)
    except Route.DoesNotExist:
        return Response({"error": "Route not found"}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        stops = route.stops.all().order_by("order")
        serializer = RouteStopSerializer(stops, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == "POST":
        data = request.data.copy()
        data["route"] = pk  # attach route id
        serializer = RouteStopSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_routestop_detail(request, pk):
    """'
    Get ,UPDATE,DELETE a single RouteStop"""
    try:
        stop = RouteStop.objects.get(pk=pk)
    except RouteStop.DoesNotExist:
        return Response({"error": "Stop not found"}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        serializer = RouteStopSerializer(stop)
        return Response(serializer.data)
    elif request.method == "PUT":
        serializer = RouteStopSerializer(stop, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == "DELETE":
        stop.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# Admin-Trip management
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_trip_list(request):
    if request.method == "GET":
        trips = Trip.objects.select_related("bus", "route").all()
        serializer = TripSerializer(trips, many=True)
        return Response(serializer.data)
    elif request.method == "POST":
        serializer = TripSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=200)
        return Response(serializer.errors, status=400)


# @api_view(["GET", "POST"])
# @permission_classes([IsAuthenticated, IsAdminUser])
# def admin_trip_list(request):
#     if request.method == "GET":
#         trips = Trip.objects.select_related("bus", "route").all()
#         serializer = TripSerializer(trips, many=True)
#         return Response(serializer.data)
#     elif request.method == "POST":
#         serializer = TripSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data, status=201)
#         return Response(serializer.errors, status=400)


@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_trip_detail(request, pk):
    try:
        trip = Trip.objects.get(pk=pk)
    except Trip.DoesNotExist:
        return Response({"error": "Trip not found"}, status=404)

    if request.method == "GET":
        serializer = TripSerializer(trip)
        return Response(serializer.data)
    elif request.method == "PUT":
        serializer = TripSerializer(trip, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)
    elif request.method == "DELETE":
        trip.delete()
        return Response(status=204)


# Admin-TripStop management
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_tripstop_list(request, pk):
    """''
    admin TripStop management
    """
    try:
        trip = Trip.objects.get(pk=pk)
    except Trip.DoesNotExist:
        return Response({"error": "Trip not found"}, status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        trip_stops = trip.trip_stops.all().order_by("arrival_time")
        serializer = TripStopSerializer(trip_stops, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    elif request.method == "POST":
        data = request.data.copy()
        data["trip"] = pk  # attach trip id
        serializer = TripStopSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET", "PUT", "DELETE"])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_tripstop_detail(request, pk):
    """''
    GET,update,delete a single TripStop"""
    try:
        trip_stop = TripStop.objects.get(pk=pk)
    except TripStop.DoesNotExist:
        return Response(
            {"error": "TripStop not found"}, status=status.HTTP_404_NOT_FOUND
        )
    if request.method == "GET":
        serializer = TripStopSerializer(trip_stop)
        return Response(serializer.data)
    elif request.method == "PUT":
        serializer = TripStopSerializer(trip_stop, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == "DELETE":
        trip_stop.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# Admin-Seat management
@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_trip_seats(request, trip_id):
    """'
    Get all seats for a trip
    """
    try:
        trip = Trip.objects.get(pk=trip_id)
    except Trip.DoesNotExist:
        return Response({"error": "Trip not found"}, status=status.HTTP_404_NOT_FOUND)
    seats = trip.seats.all().order_by("seat_number")
    serializer = SeatSerializer(seats, many=True)
    return Response(serializer.data)


@api_view(["PUT"])
@permission_classes([IsAuthenticated, IsAdminUser])
def update_seat_gender_preference(request, seat_id):
    """'
    Update gender preference for a seat"""
    try:
        seat = Seat.objects.get(pk=seat_id)
    except Seat.DoesNotExist:
        return Response({"error": "seat not found"}, status=status.HTTP_404_NOT_FOUND)
    serializer = SeatSerializer(seat, data=request.data, partial=True)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Admin-booking management
@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_all_bookings(request):
    bookings = (
        Booking.objects.select_related("trip", "user")
        .prefetch_related("seats", "passengers")
        .all()
    )
    serializer = BookingSerializer(bookings, many=True)
    return Response(serializer.data)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_delete_booking(request, booking_id):
    try:
        booking = Booking.objects.get(pk=booking_id)
    except Booking.DoesNotExist:
        return Response({"error": "Booking not found"}, status=404)
    booking.delete()
    return Response({"message": "Booking deleted"}, status=204)


# user management views
@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_users_list(request):
    """
    Get list of all users(excluding admins)
    """
    users = (
        User.objects.filter(is_staff=False)
        .annotate(
            total_bookings=Count("booking"), total_spent=Sum("booking__total_fare")
        )
        .order_by("-date_joined")
    )
    # filter by search
    search = request.query_params.get("search", None)
    if search:
        users = users.filter(
            Q(username__icontains=search)
            | Q(email__icontains=search)
            | Q(first_name__icontains=search)
            | Q(last_name__icontains=search)
        )
    # Filter by status
    is_active = request.query_params.get("is_active", None)
    if is_active is not None:
        users = users.filter(is_active=is_active.lower() == "true")

    users_data = []
    for user in users:
        users_data.append(
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "full_name": user.get_full_name(),
                "phone": getattr(user, "phone", None),
                "total_bookings": user.total_bookings or 0,
                "total_spent": float(user.total_spent or 0),
                "is_active": user.is_active,
                "date_joined": user.date_joined,
            }
        )

    return Response(users_data)


@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_toggle_user_status(request, user_id):
    """
    Toggle user active/inactive status
    """
    try:
        user = User.objects.get(id=user_id, is_staff=False)
        user.is_active = not user.is_active
        user.save()

        return Response(
            {
                "message": f'User {user.username} is now {"active" if user.is_active else "blocked"}',
                "is_active": user.is_active,
            }
        )
    except User.DoesNotExist:
        return Response({"error": "User not found"}, status=status.HTTP_404_NOT_FOUND)


# Admin-payement management
@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUser])
def admin_all_payments(request):
    payments = Payment.objects.select_related("booking", "booking__user").all()
    serializer = PaymentSerializer(payments, many=True)
    return Response(serializer.data)
