from rest_framework.decorators import api_view,permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User
from .serializers import UserSerializer


# Create your views here.
@api_view(['POST'])
@permission_classes([AllowAny])
def register_user(request):
    serializer=UserSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message":"User registered successfully"},status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
#Login view(jwt)
@api_view(["POST"])
@permission_classes([AllowAny])
def login_user(request):
    username=request.data.get('username')
    password=request.data.get('password')
    user=authenticate(username=username,password=password)
    if user is not None:
        refresh=RefreshToken.for_user(user)
        return Response({
            'refresh':str(refresh),
            'access':str(refresh.access_token),
            'username':user.username,
            'email':user.email
        })
    else:
        return Response({"error":'invalid username or password'},status=status.HTTP_401_UNAUTHORIZED)
    
# Logout view(blacklist Token)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_user(request):
    try:
        refresh_token=request.data.get('refresh')
        token=RefreshToken(refresh_token)
        token.blacklist()
        return Response({"message":"user Logged out successfully"},status=status.HTTP_205_RESET_CONTENT)
    except Exception as e:
        return Response({"error":str(e)},status=status.HTTP_400_BAD_REQUEST)