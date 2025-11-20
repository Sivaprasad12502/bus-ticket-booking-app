from users.models import Operator
from .models import Trip,TripStop
from .serializers import TripSerializer,TripStopSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated

@api_view(["GET","PUT","DELETE"])
@permission_classes([IsAuthenticated])
def operator_manage_trip(request, operator_id):
    try:
        operator=Operator.objects.get(id=operator_id)
    except Operator.DoesNotExist:
        return Response({"error":"Operator not found"},status=status.HTTP_404_NOT_FOUND)
    operator_trips=Trip.objects.filter(operator=operator)
    # Get operator trips
    if request.method=="GET":
        serializer=TripSerializer(operator_trips,many=True)
        return Response(serializer.data,status=status.HTTP_200_OK)
    if request.method=="PUT":
        trip_id=request.data.get("id")
        try:
            trip=operator_trips.get(id=trip_id)
        except Trip.DoesNotExist:
            return Response({"error":"Trip not found"},status=status.HTTP_404_NOT_FOUND)
        serializer=TripSerializer(trip,data=request.data,partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    if request.method=="DELETE":
        trip_id=request.data.get("id")
        try:
            trip=operator_trips.get(id=trip_id)
        except Trip.DoesNotExist:
            return Response({"error":"Trip not found"},status=status.HTTP_404_NOT_FOUND)
        trip.delete()
        return Response({"message":"Trip deleted successfully"},status=status.HTTP_200_OK)
    
#operator_trip_stop management
@api_view(["GET","POST"])
@permission_classes([IsAuthenticated])
def  operator_trip_stops(request,trip_id):
    try:
        trip=Trip.objects.get(id=trip_id)
    except Trip.DoesNotExist:
        return Response({"error":"Trip not found"},status=status.HTTP_404_NOT_FOUND)
    # Get trip stops
    if request.method=="GET":
        trip_stops=trip.trip_stops.all().order_by("arrival_time")
        serialzer=TripStopSerializer(trip_stops,many=True)
        return Response(serialzer.data,status=status.HTTP_200_OK)
    elif request.method=="POST":
        data=request.data.copy()
        data["trip"]=trip.id
        serialzer=TripStopSerializer(data=data)
        if serialzer.is_valid():
            serialzer.save()
            return Response(serialzer.data,status=status.HTTP_201_CREATED)
        return Response(serialzer.errors,status=status.HTTP_400_BAD_REQUEST)

@api_view(["GET","PUT","DELETE"])
@permission_classes([IsAuthenticated])
def operator_manage_trip_stop_detail(request,trip_stop_id):
    # Manage individual trip stop
    try:
        trip_stop=TripStop.objects.get(id=trip_stop_id)
    except TripStop.DoesNotExist:
        return Response({"error":"Trip stop not found"},status=status.HTTP_404_NOT_FOUND)
    if request.method=="GET":
        serializer=TripStopSerializer(trip_stop)
        return Response(serializer.data,status=status.HTTP_200_OK)
    elif request.method=="PUT":
        serializer=TripStopSerializer(trip_stop,data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data,status=status.HTTP_200_OK)
        return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    elif request.method=="DELETE":
        trip_stop.delete()
        return Response({"message":"Trip stop deleted successfully"},status=status.HTTP_204_NO_CONTENT)