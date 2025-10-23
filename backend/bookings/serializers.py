from rest_framework import serializers
from .models import Bus, Route, Trip, Seat, Booking, Passenger, Payment


class BusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bus
        fields = ["id", "bus_name", "total_seats", "bus_type", "operator_name"]


class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = ["id", "start_location", "end_location", "distance_km"]


class TripSerializer(serializers.ModelSerializer):
    bus = BusSerializer(read_only=True)
    route = RouteSerializer(read_only=True)
    bus_id = serializers.PrimaryKeyRelatedField(
        queryset=Bus.objects.all(), source="bus", write_only=True
    )
    route_id = serializers.PrimaryKeyRelatedField(
        queryset=Route.objects.all(), source="route", write_only=True
    )

    class Meta:
        model = Trip
        fields = [
            "id",
            "bus",
            "route",
            "bus_id",
            "route_id",
            "departure_time",
            "arrival_time",
            "price",
        ]



class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = ["id", "trip", "seat_number", "is_booked"]

class PassengerSerializer(serializers.ModelSerializer):
    booking = serializers.StringRelatedField(read_only=True)
    booking_id = serializers.PrimaryKeyRelatedField(
        queryset=Booking.objects.all(), write_only=True, source="booking"
    )

    class Meta:
        model = Passenger
        fields = [
            "id",
            "booking",
            "booking_id",
            "name",
            "age",
            "gender",
            "boarding_location",
            "dropping_location",
            "seat_number",
        ]

class BookingSerializer(serializers.ModelSerializer):
    seats = SeatSerializer(many=True, read_only=True)
    seat_ids = serializers.PrimaryKeyRelatedField(
        queryset=Seat.objects.all(), many=True, write_only=True, source="seats"
    )
    user = serializers.StringRelatedField(read_only=True)
    trip = TripSerializer(read_only=True)
    trip_id = serializers.PrimaryKeyRelatedField(
        queryset=Trip.objects.all(), write_only=True, source="trip"
    )
    passengers = PassengerSerializer(many=True, read_only=True,)
    class Meta:
        model = Booking
        fields = [
            "id",
            "user",
            "trip",
            "trip_id",
            "seats",
            "seat_ids",
            "passengers",
            "total_amount",
            "booking_date",
            "status",
        ]





class PaymentSerializer(serializers.ModelSerializer):
    booking = BookingSerializer(read_only=True)
    booking_id = serializers.PrimaryKeyRelatedField(
        queryset=Booking.objects.all(), write_only=True, source="booking"
    )

    class Meta:
        model = Payment
        fields = [
            "id",
            "booking",
            "booking_id",
            "stripe_payment_intent_id",
            "stripe_payment_method",
            "amount",
            "currency",
            "payment_status",
            "receipt_url",
            "payment_date",
        ]
