from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
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


# route-Stop_list
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
        # roundTrip
        return_date = request.query_params.get("returnDate")
        start = request.query_params.get("from")
        end = request.query_params.get("to")
        trips = Trip.objects.all()
        onward_trips = trips.filter(
            route__start_location__iexact=start,
            route__end_location__iexact=end,
        )
        # if start and end:
        #     trips = trips.filter(
        #         route__start_location__icontains=start,
        #         route__end_location__icontains=end,
        #     )
        return_trips = []
        if return_date:
            # find trips in reverse direction
            return_trips = trips.filter(
                route__start_location__iexact=end, route__end_location__iexact=start
            )
        # filter by date logic
        if travel_date:
            travel_date = datetime.strptime(travel_date, "%Y-%m-%d").date()
            today = timezone.localdate()
            #filtering by departure date
            onward_trips=onward_trips.filter(departure__date=travel_date)
            if travel_date == today:
                # current_dt = timezone.localtime()
                # time_plus_3hr = current_dt + timedelta(hours=3)
                # print(current_dt, "currrrent-timeee")
                # trips = trips.filter(departure_time__gte=time_plus_3hr.time())
                now = timezone.localtime()
                # trips = trips.filter(departure_time__gte=now)
                onward_trips = onward_trips.filter(departure__gte=now)
        if return_date:
            return_date = datetime.strptime(return_date, "%Y-%m-%d").date()
            today = timezone.localdate()
            return_trips=return_trips.filter(departure__date=return_date)
            if return_date == today:
                now = timezone.localtime()
                return_trips=return_trips.filter(departure__gte=now)
        # serializer = TripSerializer(trips, many=True)
        onward_serializer = TripSerializer(onward_trips, many=True)
        return_serializer = TripSerializer(return_trips, many=True)
        # return Response(serializer.data)
        return Response(
            {
                "onwardTrips": onward_serializer.data,
                "returnTrips": return_serializer.data,
            }
        )
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
        onward_trip_id = request.data.get("onward_trip_id")
        return_trip_id = request.data.get("return_trip_id")  # optional
        onward_seats = request.data.get("onward_seats", [])
        return_seats = request.data.get("return_seats", [])
        onward_passengers = request.data.get("onward_passengers", [])
        return_passengers = request.data.get("return_passengers", [])
        onward_date = request.data.get("onward_date")
        return_date = request.data.get("return_date")
        # trip_id = request.data.get("trip_id")
        # seat_numbers = request.data.get("seats")
        # booked_date = request.data.get("booked_date")
        # passengers_data = request.data.get("passengers", [])
        if not onward_trip_id or not onward_seats or not onward_date:
            return Response(
                {
                    "error": "trip_id,seats, and booked_date are required for onward trip trip"
                },
                status=status.HTTP_400_BAD_REQUEST,
            )
        create_bookings = []

        # Helper function to create a booking
        def process_trip_bookings(trip_id, seats, passengers, date):
            try:
                trip = Trip.objects.get(pk=trip_id)
            except Trip.DoesNotExist:
                return None, Response({"error": f"trip{trip_id} not found"}, status=400)
            booked_seat_numbers = Booking.objects.filter(
                trip=trip, booked_date=date, status="CONFIRMED"
            ).values_list("seats__seat_number", flat=True)
            available_seats = Seat.objects.filter(
                trip=trip, seat_number__in=seats
            ).exclude(seat_number__in=booked_seat_numbers)
            if available_seats.count() != len(seats):
                return None, Response(
                    {"error": "One or more seats are already booked"}, status=400
                )
            if not passengers or len(passengers) != len(seats):
                return None, Response(
                    {"error": "passengers info required for all seat"}, status=400
                )
            #Women ONLY SEAT VALIDATION
            for seat_num,passenger in zip(seats,passengers):
                seat_obj=Seat.objects.get(trip=trip,seat_number=seat_num)
                if seat_obj.gender_preference=="WOMEN_ONLY" and passenger.get("gender")!="F":
                    return None, Response(
                        {
                            "error": f"seat {seat_num} is reserved for women only"
                        },
                        status=400
                    )
            # Fare calculation per passenger
            total_amount = 0
            fare_list=[]
            for p in passengers:
                boarding = p.get("boarding_location")
                dropping = p.get("dropping_location")
                from_stop = TripStop.objects.filter(
                    trip=trip, route_stop__stop_name__iexact=boarding
                ).first()
                to_stop = TripStop.objects.filter(
                    trip=trip, route_stop__stop_name__iexact=dropping
                ).first()
                fare = trip.price
                if from_stop and to_stop:
                    try:
                        distance_fare = float(to_stop.fare_from_start or 0) - float(
                            from_stop.fare_from_start or 0
                        )
                        fare = max(distance_fare, 0)
                    except (TypeError, ValueError):
                        fare = trip.price
                fare_list.append(fare)
                total_amount+=fare
            booking = Booking.objects.create(
                user=user,
                trip=trip,
                total_amount=total_amount,
                booked_date=date,
                payment_deadline=timezone.now() + timedelta(minutes=10),
            )
            booking.seats.set(available_seats)
            for p,fare in zip( passengers,fare_list):
                Passenger.objects.create(
                    booking=booking,
                    name=p.get("name"),
                    age=p.get("age"),
                    gender=p.get("gender"),
                    boarding_location=p.get("boarding_location"),
                    dropping_location=p.get("dropping_location"),
                    seat_number=p.get("seat_number"),
                    fare=fare,
                )
            return booking, None

        # process onward Trip
        onward_booking, error = process_trip_bookings(
            onward_trip_id, onward_seats, onward_passengers, onward_date
        )
        if error:
            return error
        create_bookings.append(onward_booking)
        # process return Trip if provided
        if return_trip_id and return_seats and return_date:
            return_booking, error = process_trip_bookings(
                return_trip_id, return_seats, return_passengers, return_date
            )
            if error:
                return error
            create_bookings.append(return_booking)
        total_amount = sum(b.total_amount for b in create_bookings)
        return Response(
            {
                "bookings":[
                    {"booking_id": b.id, "trip_id": b.trip.id, "amount": b.total_amount}
                    for b in create_bookings
                ],
                "total_amount":total_amount,
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



@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_payment_intent(request):
    booking_ids=request.data.get("booking_ids",[])
    if not booking_ids:
        return Response({"error":"booking_ids are required"},status=400)
    bookings=Booking.objects.filter(pk__in=booking_ids,user=request.user)
    if not bookings.exists():
        return Response({"error":"No valid bookings found"},status=404)
    # Check each booking
    for b in bookings:
        if b.status != "PENDING_PAYMENT":
            return Response(
                {"error": f"booking{b.id} cannot be paid anymore"}, status=400
            )
        if b.payment_deadline and timezone.now() > b.payment_deadline:
            b.status = "EXPIRED"
            b.save()
            return Response({"error": f"Payment time expired for booking {b.id}. Please rebook."}, status=400)
    total_amount=sum(b.total_amount for b in bookings)
    amount=int(total_amount*100)
    try:
        # create Stripe PaymentIntent
        intent = stripe.PaymentIntent.create(
            amount=amount,
            currency="inr",
            # payment_method_types=["card","upi","netbanking","wallet"],
            metadata={"booking_Ids":",".join(map(str,booking_ids)), "user": request.user.username},
        )
        #Create or update Payment entries
        for b in bookings:
            Payment.objects.update_or_create(
                booking=b,
                defaults={
                    "amount":b.total_amount,
                    "stripe_payment_intent_id":intent.id,
                    "payment_status":"PENDING",
                    "currency":"inr"
                }
            )

        # Save Payment info in DB
        # payment, created = Payment.objects.get_or_create(
        #     booking=booking,
        #     defaults={
        #         "amount": booking.total_amount,
        #         "stripe_payment_intent_id": intent.id,
        #         "currency": currency,
        #         "payment_status": "PENDING",
        #     },
        # )
        # if not created:
        #     payment.amount = booking.total_amount
        #     payment.stripe_payment_intent_id = intent.id
        #     payment.currency = currency
        #     payment.payment_status = "PENDING"
        #     payment.save()
        # serializer = PaymentSerializer()
        return Response(
            {
                "clientSecret": intent.client_secret,
                "publishableKey": settings.STRIPE_PUBLISHABLE_KEY,
                # "payment": serializer.data,
                "totalAmount":total_amount,
            },
            status=200,
        )
    except Exception as e:
        return Response({"error": str(e)}, status=400)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def confirm_payment(request):
    booking_ids=request.data.get("booking_ids",[])
    if not booking_ids:
        return Response({"error":"No booking IDs provided"},status=400)
    try:
        bookings = Booking.objects.filter(pk__in=booking_ids, user=request.user)
    except Booking.DoesNotExist:
        return Response({"error": "Booking not found"}, status=404)
    for booking in bookings:

        payment = Payment.objects.filter(booking=booking).first()
        if payment:
            payment.payment_status="SUCCESS"
            payment.save()

            payment.payment_status = "SUCCESS"
        payment.save()
        booking.status = "CONFIRMED"
        booking.payment_deadline = None  # clear deadline
        booking.save()
        if not payment:
            return Response({"error": "Payment not found"}, status=404)

    serializer = PaymentSerializer(payment)
    return Response(serializer.data, status=200)


#Applying cancellation policies
def get_refund_percentage(booking):
    trip_date=booking.booked_date
    trip_time=booking.trip.departure

    #combine into one datetime
    trip_datetime=timezone.make_aware(datetime.combine(trip_date,trip_time))
    now=timezone.now()
    hours_left=(trip_datetime - now).total_seconds()/3600
    if hours_left>72:
        return 1.0 #100%
    elif 48< hours_left <=72:
        return 0.90
    elif 24 <hours_left <=48:
        return 0.75
    elif 12 <hours_left <=24:
        return 0.50
    else:
        return 0.0

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
    # Payment exists -> Determine refund amount based on policy
    refund_percent=get_refund_percentage(booking)
    refund_amount=float(booking.total_amount)*refund_percent
    refund_paise=int(refund_amount*100)
    try:
        # only refund successfull payments
        if payment.payment_status == "SUCCESS" and payment.stripe_payment_intent_id:
            intent = stripe.PaymentIntent.retrieve(payment.stripe_payment_intent_id)
            if intent.status == "succeeded" and intent.latest_charge:
                if refund_paise>0:
                    
                    refund = stripe.Refund.create(
                        payment_intent=payment.stripe_payment_intent_id,
                        amount=int(refund_amount*100)
                    )
                    payment.refund_id = refund.id
                    payment.payment_status = "REFUNDED"
                    payment.save()
                    refund_message = "Refund initialted succesfully"
                else:
                    payment.payment_status="NO_REFUND"
                    payment.save()
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
                "refund_percentage":refund_amount,
                "refund_amount":refund_amount,
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
