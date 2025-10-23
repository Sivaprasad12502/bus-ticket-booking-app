from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.utils import timezone
from .models import Bus, Route, Trip, Seat, Booking, Passenger, Payment
from .serializers import (
    BusSerializer,
    RouteSerializer,
    TripSerializer,
    SeatSerializer,
    PassengerSerializer,
    PaymentSerializer,
    BookingSerializer,
)

# for stripe
import stripe
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
        # trips=Trip.objects.filter(departure_time__gte=timezone.now())#only future trips
        trips = Trip.objects.all()
        # Optional:filter by start and end locations if provided in query params
        start = request.query_params.get("from")
        end = request.query_params.get("to")
        if start and end:
            trips = trips.filter(
                route__start_location__icontains=start,
                route__end_location__icontains=end,
            )
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
    try:
        trip = Trip.objects.get(pk=trip_id)
    except Trip.DoesNotExist:
        return Response(status=status.HTTP_404_NOT_FOUND)
    seats = trip.seats.filter(is_booked=False)
    serializer = SeatSerializer(seats, many=True)
    return Response(serializer.data)


# Booking Seats
@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def create_bookings(request):
    if request.method == "GET":
        bookings = Booking.objects.filter(user=request.user)
        serializer = BookingSerializer(bookings, many=True)
        return Response(serializer.data)
    elif request.method == "POST":
        user = request.user
        trip_id = request.data.get("trip_id")
        seat_numbers = request.data.get("seats")
        if isinstance(seat_numbers, str):
            seat_numbers = [seat_numbers]
        try:
            trip = Trip.objects.get(pk=trip_id)
        except Trip.DoesNotExist:
            return Response(
                {"error": "Trip not found"}, status=status.HTTP_404_NOT_FOUND
            )
        seats = Seat.objects.filter(
            trip=trip, seat_number__in=seat_numbers, is_booked=False
        )
        if seats.count() != len(seat_numbers):
            return Response(
                {"error": "One or more seats are already booked"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        total_amount = sum([trip.price for _ in seats])
        booking = Booking.objects.create(
            user=user, trip=trip, total_amount=total_amount
        )
        booking.seats.set(seats)
        # Mark seats as booked
        seats.update(is_booked=True)
        return Response(
            {
                "booking_id": booking.id,
                "total_amount": total_amount,
                "booked_seats": seat_numbers,
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
    booking.save()

    serializer = PaymentSerializer(payment)
    return Response(serializer.data, status=200)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def cancel_bookings(request,booking_Id):
    '''
    cancel a booking and issue a Stripe refund if payement was made.
    '''
    try:
        booking=Booking.objects.get(pk=booking_Id,user=request.user)
    except Booking.DoesNotExist:
        return Response({"error":"Booking not found"},status=status.HTTP_400_BAD_REQUEST)
    #If already cancelled, avoid duplicate refund
    if booking.status=="CANCELLED":
        return Response({"error":"Booking already cancelled"},status=status.HTTP_400_BAD_REQUEST)
    #Check if there is a payment linked
    payment=Payment.objects.filter(booking=booking).first()
    if not payment:
        # return Response({"erorr":"no payement record found the this booking"},status=status.HTTP_400_BAD_REQUEST)
        booking.status="CANCELLED"
        booking.seats.update(is_booked=False)
        booking.delete()
        return Response({"message": "Booking deleted (no payment found)"}, status=status.HTTP_200_OK)
    try:
        # only refund successfull payments
        if payment.payment_status=="SUCCESS" and payment.stripe_payment_intent_id:
            refund=stripe.Refund.create(
                payment_intent=payment.stripe_payment_intent_id
            )
            payment.refund_id=refund.id
            payment.payment_status="REFUNDED"
        #mark booking cancelled
        booking.status="CANCELLED"
        #Free up seats
        booking.seats.update(is_booked=False)
        booking.delete()
        return Response({
           "message": "Booking cancelled successfully and refund initiated (if applicable)",
           "booking_id":booking.id,
           "refund_id":getattr(payment,"refund_id",None),
           "status":booking.status
        },
        status=status.HTTP_200_OK)
    except stripe.error.StripeError as e:
        return Response(
             {"error": f"Stripe error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


