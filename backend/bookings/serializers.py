from rest_framework import serializers
from .models import (
    Bus,
    Route,
    RouteStop,
    Trip,
    Seat,
    Booking,
    Passenger,
    Payment,
    TripStop,
)


class BusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bus
        fields = [
            "id",
            "bus_name",
            "total_seats",
            "bus_type",
            "layout_type",
            "operator_name",
            "operator_mobile",
        ]


class RouteStopSerializer(serializers.ModelSerializer):
    class Meta:
        model = RouteStop
        fields = [
            "id",
            "route",
            "stop_name",
            "order",
            "distance_from_start",
            # "fare_from_start",
        ]


class RouteSerializer(serializers.ModelSerializer):
    stops = RouteStopSerializer(many=True, read_only=True)

    class Meta:
        model = Route
        fields = ["id", "start_location", "end_location", "distance_km", "stops"]


class TripStopSerializer(serializers.ModelSerializer):
    stop_name = serializers.CharField(source="route_stop.stop_name", read_only=True)
    # arrival_time = serializers.SerializerMethodField()
    arrival_time = serializers.TimeField(
        format="%I:%M %p", input_formats=["%H:%M", "%H:%M:%S"], required=False
    )

    class Meta:
        model = TripStop
        fields = [
            "id",
            "stop_name",
            "trip",
            "route_stop",
            "arrival_time",
            "fare_from_start",
        ]

    def get_arrival_time(self, obj):
        return obj.arrival_time.strftime("%I:%M %p") if obj.arrival_time else None


class TripSerializer(serializers.ModelSerializer):
    bus = BusSerializer(read_only=True)
    route = RouteSerializer(read_only=True)
    trip_stops = TripStopSerializer(many=True, read_only=True)
    bus_id = serializers.PrimaryKeyRelatedField(
        queryset=Bus.objects.all(), source="bus", write_only=True
    )
    route_id = serializers.PrimaryKeyRelatedField(
        queryset=Route.objects.all(), source="route", write_only=True
    )
    # departure_time = serializers.SerializerMethodField()
    # arrival_time = serializers.SerializerMethodField()

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
            "trip_stops",
        ]

    # Format only for output
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data["departure_time"] = (
            instance.departure_time.strftime("%I:%M %p")
            if instance.departure_time
            else None
        )
        data["arrival_time"] = (
            instance.arrival_time.strftime("%I:%M %p")
            if instance.arrival_time
            else None
        )
        return data

    # def get_departure_time(self, obj):
    #     return obj.departure_time.strftime("%I:%M %p") if obj.departure_time else None

    # def get_arrival_time(self, obj):
    #     return obj.arrival_time.strftime("%I:%M %p") if obj.arrival_time else None


class SeatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Seat
        fields = ["id", "trip", "seat_number", "gender_preference"]


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
            "fare",
        ]


class PaymentSerializer(serializers.ModelSerializer):
    booking = serializers.StringRelatedField(read_only=True)
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
            "refund_id",
            "stripe_payment_method",
            "amount",
            "currency",
            "payment_status",
            "receipt_url",
            "payment_date",
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
    passengers = PassengerSerializer(
        many=True,
        read_only=True,
    )
    payments = PaymentSerializer(read_only=True)

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
            "payments",
            "total_amount",
            "booking_date",
            "booked_date",
            "status",
        ]
