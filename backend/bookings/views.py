from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils import timezone
from datetime import datetime, time, timedelta
from .models import Bus, Route, Trip, Seat, Booking, Passenger, Payment, RouteStop
from .serializers import (
    BusSerializer,
    RouteSerializer,
    TripSerializer,
    SeatSerializer,
    PassengerSerializer,
    PaymentSerializer,
    BookingSerializer,
    RouteStopSerializer
)
from django.db.models import Q

# for stripe
import stripe
from stripe._error import StripeError
from django.conf import settings

stripe.api_key = settings.STRIPE_SECRET_KEY


# Create your views here.
# List all buses or create new
@api_view(["GET", "POST"])
def bus_list(request):
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


# single bus details
@api_view(["GET", "PUT", "DELETE"])
def bus_detail(request, pk):
    try:
        bus = Bus.objects.get(pk=pk)
    except Bus.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
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

#route-Stop_list
# @api_view(["GET","POST"])
# # @permission_classes([IsAuthenticated])
# def route_stop_list(request):
#     if request.method=="GET":
#         route_stops=RouteStop.objects.all()
#         serializer=RouteStopSerializer(route_stops,many=True)
#         return Response(serializer.data)
#     elif request.method=="POST":
#         serializer=RouteStopSerializer(data=request.data)
#         if serializer.is_valid():
#             serializer.save()
#             return Response(serializer.data,status=status.HTTP_201_CREATED)
#         return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
# Routes
@api_view(["GET", "POST"])
def route_list(request):
    if request.method == "GET":
        routes = Route.objects.all()
        serializer = RouteSerializer(routes, many=True)
        return Response(serializer.data)
    elif request.method == "POST":
        serializer = RouteSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# single_route_detail
@api_view(["GET", "PUT", "DELETE"])
def route_detail(request, pk):
    try:
        route = Route.objects.get(pk=pk)
    except Route.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        serializer = RouteSerializer(route)
        return Response(serializer.data)
    elif request.method == "PUT":
        serializer = RouteSerializer(route, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == "DELETE":
        route.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# Trips
@api_view(["GET", "POST"])
def trip_list(request):
    if request.method == "GET":
        # trips=Trip.objects.filter(departure_time__gte=timezone.localtime().time())#only future trips
        # Optional:filter by start and end locations if provided in query params
        travel_date = request.query_params.get("date")
        start = request.query_params.get("from")
        end = request.query_params.get("to")
        trips = Trip.objects.all()
        if start and end:
            trips = trips.filter(
                route__start_location__icontains=start,
                route__end_location__icontains=end,
            )
        if travel_date:
            travel_date = datetime.strptime(travel_date, "%Y-%m-%d").date()
            today = timezone.localdate()
            if travel_date == today:
                # current_dt = timezone.localtime()
                # time_plus_3hr = current_dt + timedelta(hours=3)
                # print(current_dt, "currrrent-timeee")
                # trips = trips.filter(departure_time__gte=time_plus_3hr.time())
                now = timezone.localtime().time()
                trips = trips.filter(departure_time__gte=now)
        serializer = TripSerializer(trips, many=True)
        return Response(serializer.data)
    elif request.method == "POST":
        serializer = TripSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# single Trip details
@api_view(["GET", "PUT", "DELETE"])
def trip_detail(request, pk):
    try:
        trip = Trip.objects.get(pk=pk)
    except Trip.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    if request.method == "GET":
        serializer = TripSerializer(trip)
        return Response(serializer.data)
    elif request.method == "PUT":
        serializer = TripSerializer(trip, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    elif request.method == "DELETE":
        trip.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# Available Seats for a trip
@api_view(["GET"])
def trip_available_seats(request, trip_id):
    Booking.objects.filter(
        status="PENDING_PAYMENT", payment_deadline__lt=timezone.now()
    ).update(status="EXPIRED")

    # try:
    #     trip = Trip.objects.get(pk=trip_id)
    # except Trip.DoesNotExist:
    #     return Response(status=status.HTTP_404_NOT_FOUND)
    # seats = trip.seats.filter(is_booked=False)
    # serializer = SeatSerializer(seats, many=True)
    # return Response(serializer.data)
    date = request.query_params.get("date")
    if not date:
        return Response({"error": "date parameter is required"}, status=400)
    try:
        trip = Trip.objects.get(pk=trip_id)
    except Trip.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    booked_seat_numbers = (
        Booking.objects.filter(trip=trip, booked_date=date)
        .filter(
            Q(status="CONFIRMED")
            | Q(status="PENDING_PAYMENT", payment_deadline__gte=timezone.now())
        )
        .values_list("seats__seat_number", flat=True)
    )
    # return seats not in that list
    available_seats = trip.seats.exclude(seat_number__in=booked_seat_numbers)
    serializer = SeatSerializer(available_seats, many=True)
    # Ensure response reflects availability for the requested date.
    # Some seat rows may carry a stale `is_booked` boolean; the API's contract
    # is to return only seats available for the given date. Normalize the
    # serialized output so the frontend doesn't rely on the model-level
    # `is_booked` flag (which is not date-scoped).
    data = serializer.data
    for item in data:
        item["is_booked"] = False
    return Response(data)


# Booking Seats
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def create_bookings(request):
    if request.method == "GET":
        Booking.objects.filter(
            status="PENDING_PAYMENT", payment_deadline__lt=timezone.now()
        ).update(status="EXPIRED")

        bookings = Booking.objects.filter(user=request.user)
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)
    elif request.method == "POST":
        user = request.user
        trip_id = request.data.get("trip_id")
        seat_numbers = request.data.get("seats")
        booked_date = request.data.get("booked_date")
        passengers_data = request.data.get("passengers", [])
        if not trip_id or not seat_numbers or not booked_date:
            return Response(
                {"error": "trip_id, seats, and booked_date are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if isinstance(seat_numbers, str):
            seat_numbers = [seat_numbers]
        try:
            trip = Trip.objects.get(pk=trip_id)
        except Trip.DoesNotExist:
            return Response(
                {"error": "Trip not found"}, status=status.HTTP_404_NOT_FOUND
            )
        # seats = Seat.objects.filter(
        #     trip=trip, seat_number__in=seat_numbers, is_booked=False
        # )
        booked_seat_numbers = Booking.objects.filter(
            trip=trip, booked_date=booked_date, status="CONFIRMED"
        ).values_list("seats__seat_number", flat=True)
        # filter seats that are not already booked for that date
        seats = Seat.objects.filter(trip=trip, seat_number__in=seat_numbers).exclude(
            seat_number__in=booked_seat_numbers
        )
        if seats.count() != len(seat_numbers):
            return Response(
                {"error": "One or more seats are already booked"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # require at least one passenger per (same count as seats)
        if not passengers_data or len(passengers_data) != len(seat_numbers):
            return Response(
                {"error": "passengers passengers details for all seats"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # total_amount = sum([trip.price for _ in seats])
        # total_amount = trip.price * len(seat_numbers)
        # calculate toal fare based on boarding/dropping
        total_amount = 0
        for p in passengers_data:
            boarding = p.get("boarding_location")
            dropping = p.get("dropping_location")
            passenger_fare = trip.price
            if boarding and dropping:
                from_stop = RouteStop.objects.filter(
                    route=trip.route, stop_name__iexact=boarding
                ).first()
                to_stop = RouteStop.objects.filter(
                    route=trip.route, stop_name__iexact=dropping
                ).first()

                if from_stop and to_stop:
                    try:
                        distance_fare = float(to_stop.fare_from_start or 0) - float(from_stop.fare_from_start or 0)
                        passenger_fare = max(distance_fare, 0)
                    except (TypeError, ValueError):
                        passenger_fare = trip.price
            total_amount += passenger_fare
        # Create Booking
        booking = Booking.objects.create(
            user=user,
            trip=trip,
            total_amount=total_amount,
            booked_date=booked_date,
            payment_deadline=timezone.now() + timedelta(minutes=10),  # hold for 10 mins
        )
        booking.seats.set(seats)
        # Mark seats as booked
        # seats.update(is_booked=True)
        # Create passengers
        for p in passengers_data:
            boarding = p.get("boarding_location")
            dropping = p.get("dropping_location")

            from_stop = RouteStop.objects.filter(
                route=trip.route, stop_name__iexact=boarding
            ).first()
            to_stop = RouteStop.objects.filter(
                route=trip.route, stop_name__iexact=dropping
            ).first()

            fare = trip.price
            if from_stop and to_stop:
                fare = max(
                    float(to_stop.fare_from_start) - float(from_stop.fare_from_start), 0
                )

            Passenger.objects.create(
                booking=booking,
                name=p.get("name"),
                age=p.get("age"),
                gender=p.get("gender"),
                # boarding_location=p.get("boarding_location"),
                # dropping_location=p.get("dropping_location"),
                boarding_location=boarding,
                dropping_location=dropping,
                fare=fare,
                seat_number=p.get("seat_number"),
            )
        return Response(
            {
                "booking_id": booking.id,
                "total_amount": total_amount,
                "booked_seats": seat_numbers,
                "passengers": passengers_data,
            },
            status=status.HTTP_201_CREATED,
        )


# passengers to booking


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def add_passengers(request, booking_id):
    try:
        booking = Booking.objects.get(pk=booking_id, user=request.user)
    except Booking.DoesNotExist:
        return Response(
            {"error": "Booking not found"}, status=status.HTTP_404_NOT_FOUND
        )
    passengers_data = request.data.get("passengers")  # list of dicts
    passengers = []
    for p in passengers_data:
        passenger = Passenger.objects.create(
            booking=booking,
            name=p["name"],
            age=p["age"],
            gender=p["gender"],
            boarding_location=p["boarding_location"],
            dropping_location=p["dropping_location"],
            seat_number=p.get("seat_number", ""),
        )
        passengers.append(passenger)
    serializer = PassengerSerializer(passengers, many=True)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


# payment
# @api_view(['POST'])
# # @permission_classes([IsAuthenticated])
# def create_payment(request,booking_id):
#     try:
#         booking=Booking.objects.get(pk=booking_id,user=request.user)
#     except Booking.DoesNotExist:
#         return Response({"error":"Booking not found"},status=status.HTTP_404_NOT_FOUND)
#     payment_id=request.data.get('payment_id')
#     amount=booking.total_amount
#     payment=Payment.objects.create(
#         booking=booking,
#         payment_id=payment_id,
#         amount=amount,
#         payment_status="SUCCESS"
#     )
#     booking.status="CONFIRMED"
#     booking.save()
#     serializer=PayementSerializer(payment)
#     return Response(serializer.data)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_payment_intent(request, booking_Id):
    try:
        booking = Booking.objects.get(pk=booking_Id, user=request.user)
    except Booking.DoesNotExist:
        return Response({"error": "Booking not found"}, status=404)
    if booking.status != "PENDING_PAYMENT":
        return Response(
            {"error": "This booking is cannot be paind anymore."}, status=400
        )
    if booking.payment_deadline and timezone.now() > booking.payment_deadline:
        booking.status = "EXPIRED"
        booking.save()
        return Response({"error": "Payment time expired. Please rebook."}, status=400)
    amount = int(booking.total_amount * 100)  # convert to paise
    currency = "inr"
    try:
        # create Stripe PaymentIntent
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency=currency,
            metadata={"booking_Id": booking.id, "user": request.user.username},
        )
        # Save Payment info in DB
        payment, created = Payment.objects.get_or_create(
            booking=booking,
            defaults={
                "amount": booking.total_amount,
                "stripe_payment_intent_id": intent.id,
                "currency": currency,
                "payment_status": "PENDING",
            },
        )
        if not created:
            payment.amount = booking.total_amount
            payment.stripe_payment_intent_id = intent.id
            payment.currency = currency
            payment.payment_status = "PENDING"
            payment.save()
        serializer = PaymentSerializer(payment)
        return Response(
            {
                "clientSecret": intent.client_secret,
                "publishableKey": settings.STRIPE_PUBLISHABLE_KEY,
                "payment": serializer.data,
            }
        )
    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def confirm_payment(request, booking_Id):
    try:
        booking = Booking.objects.get(pk=booking_Id, user=request.user)
    except Booking.DoesNotExist:
        return Response({"error": "Booking not found"}, status=404)

    payment = Payment.objects.filter(booking=booking).first()
    if not payment:
        return Response({"error": "Payment not found"}, status=404)

    payment.payment_status = "SUCCESS"
    payment.save()
    booking.status = "CONFIRMED"
    booking.payment_deadline = None  # clear deadline
    booking.save()

    serializer = PaymentSerializer(payment)
    return Response(serializer.data, status=200)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cancel_bookings(request, booking_Id):
    """
    cancel a booking and issue a Stripe refund if payement was made.
    """
    try:
        booking = Booking.objects.get(pk=booking_Id, user=request.user)
    except Booking.DoesNotExist:
        return Response(
            {"error": "Booking not found"}, status=status.HTTP_400_BAD_REQUEST
        )
    # If already cancelled, avoid duplicate refund
    if booking.status == "CANCELLED":
        return Response(
            {"error": "Booking already cancelled"}, status=status.HTTP_400_BAD_REQUEST
        )
    # Check if there is a payment linked
    payment = Payment.objects.filter(booking=booking).first()
    if not payment:
        # return Response({"erorr":"no payement record found the this booking"},status=status.HTTP_400_BAD_REQUEST)
        booking.status = "CANCELLED"
        # booking.seats.update(is_booked=False)
        # booking.delete()
        booking.save()
        return Response(
            {"message": "Booking deleted (no payment found)"}, status=status.HTTP_200_OK
        )
    try:
        # only refund successfull payments
        if payment.payment_status == "SUCCESS" and payment.stripe_payment_intent_id:
            intent = stripe.PaymentIntent.retrieve(payment.stripe_payment_intent_id)
            if intent.status == "succeeded" and intent.latest_charge:
                refund = stripe.Refund.create(
                    payment_intent=payment.stripe_payment_intent_id
                )
                payment.refund_id = refund.id
                payment.payment_status = "REFUNDED"
                payment.save()
                refund_message = "Refund initialted succesfully"
            else:
                refund_message = f"no refund - PaymentIntent status is {intent.status}"
        else:
            refund_message = "no refund - payment not successful or not intent ID"
        # mark booking cancelled
        booking.status = "CANCELLED"
        # Free up seats
        # booking.seats.update(is_booked=False)
        booking_id = booking.id
        booking.save()
        return Response(
            {
                "message": "Booking cancelled successfully and refund initiated (if applicable)",
                "booking_id": booking_id,
                "refund_id": getattr(payment, "refund_id", None),
                "status": booking.status,
            },
            status=status.HTTP_200_OK,
        )
    except StripeError as e:
        return Response(
            {"error": f"Stripe error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
