from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User
from .serializers import UserSerializer,AdminUserSerializer


# Create your views here.
@api_view(["POST"])
@permission_classes([AllowAny])
def register_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "message": "User registered successfully",
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "username": user.username,
                "email": user.email,
            },
            status=status.HTTP_201_CREATED,
        )

    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Login view(jwt)
@api_view(["POST"])
@permission_classes([AllowAny])
def login_user(request):
    username = request.data.get("username")
    password = request.data.get("password")
    user = authenticate(username=username, password=password)
    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "username": user.username,
                "email": user.email,
            }
        )
    else:
        return Response(
            {"error": "invalid username or password"},
            status=status.HTTP_401_UNAUTHORIZED,
        )


# Logout view(blacklist Token)
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_user(request):
    try:
        refresh_token = request.data.get("refresh")
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response(
            {"message": "user Logged out successfully"},
            status=status.HTTP_205_RESET_CONTENT,
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


#admin Register
@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdminUser])
def register_admin(request):
    username=request.data.get("username")
    try:
        #Try to find existing user
        user=User.objects.get(username=username)
        user.is_staff=True
        user.is_superuser=True
        user.save()
        message=f"user {username} promoted to admin successfully."
    except User.DoesNotExist:
        serializer=AdminUserSerializer(data=request.data)
        if serializer.is_valid():
            user=serializer.save()
            user.is_staff=True
            user.is_superuser=True # optional
            user.save()
            message=f"New admin {username} created successfully."
        else:
            return Response(serializer.errors,status=status.HTTP_400_BAD_REQUEST)
    refresh=RefreshToken.for_user(user)
    return Response({
        "message":message,
        "refresh":str(refresh),
        "access":str(refresh.access_token),
        "username":user.username,
        # "email":user.email 
        "is_staff":user.is_staff,

    },status=status.HTTP_201_CREATED)

#admin Login view
@api_view(["POST"])
@permission_classes([AllowAny])
def login_admin(request):
    username=request.data.get("username")
    password=request.data.get("password")
    user=authenticate(username=username,password=password)
    if user and user.is_staff:
        refresh=RefreshToken.for_user(user)
        return Response({
            "refresh":str(refresh),
            "access":str(refresh.access_token),
            "username":user.username,
            "email":user.email,
            "is_staff":user.is_staff
        })
    return Response({"error":"Invalid credentials or not an admin"},status=401)

#admin Logout view
@api_view(["POST"])
@permission_classes([IsAuthenticated,IsAdminUser])
def logout_admin(request):
    try:
        refreshToken=request.data.get("refresh")
        token=RefreshToken(refreshToken)
        token.blacklist()
        return Response({"message":"Admin logged out successfully"},status=status.HTTP_205_RESET_CONTENT)
    except Exception as e:
        return Response({"error":str(e)},status=status.HTTP_400_BAD_REQUEST)
    