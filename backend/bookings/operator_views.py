from users.models import Operator
from .models import Trip
from .serializers import TripSerializer
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
        trip_id=request.data.get("trip_id")
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
        trip_id=request.data.get("trip_id")
        try:
            trip=operator_trips.get(id=trip_id)
        except Trip.DoesNotExist:
            return Response({"error":"Trip not found"},status=status.HTTP_404_NOT_FOUND)
        trip.delete()
        return Response({"message":"Trip deleted successfully"},status=status.HTTP_200_OK)
    