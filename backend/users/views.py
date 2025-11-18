from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, Operator
from .serializers import UserSerializer, AdminUserSerializer,OperatorSerializer


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


# admin Register
@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdminUser])
def register_admin(request):
    username = request.data.get("username")
    try:
        # Try to find existing user
        user = User.objects.get(username=username)
        user.is_staff = True
        user.is_superuser = True
        user.save()
        message = f"user {username} promoted to admin successfully."
    except User.DoesNotExist:
        serializer = AdminUserSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            user.is_staff = True
            user.is_superuser = True  # optional
            user.save()
            message = f"New admin {username} created successfully."
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    refresh = RefreshToken.for_user(user)
    return Response(
        {
            "message": message,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "username": user.username,
            # "email":user.email
            "is_staff": user.is_staff,
        },
        status=status.HTTP_201_CREATED,
    )


# admin Login view
@api_view(["POST"])
@permission_classes([AllowAny])
def login_admin(request):
    username = request.data.get("username")
    password = request.data.get("password")
    user = authenticate(username=username, password=password)
    if user and user.is_staff:
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "username": user.username,
                "email": user.email,
                "is_staff": user.is_staff,
            }
        )
    return Response({"error": "Invalid credentials or not an admin"}, status=401)


# admin Logout view
@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdminUser])
def logout_admin(request):
    try:
        refreshToken = request.data.get("refresh")
        token = RefreshToken(refreshToken)
        token.blacklist()
        return Response(
            {"message": "Admin logged out successfully"},
            status=status.HTTP_205_RESET_CONTENT,
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# operator Register
@api_view(["POST"])
@permission_classes([IsAuthenticated, IsAdminUser])
def create_operator(request):
    username = request.data.get("username")
    password = request.data.get("password")
    company_name = request.data.get("company_name")
    phone = request.data.get("phone")
    # Create user
    user = User.objects.create_user(username=username, password=password)
    user.is_staff = True
    user.save()

    # create operator profile
    operator = Operator.objects.create(
        user=user, company_name=company_name, phone=phone
    )
    return Response(
        {
            "message": "Operator created successfully",
            "operator_id": str(operator.operator_key),
            "username": username,
        }
    )


# operator Login view
@api_view(["POST"])
@permission_classes([AllowAny])
def login_operator(request):
    username = request.data.get("username")
    password = request.data.get("password")
    user = authenticate(username=username, password=password)
    if user is None:
        return Response({"error": "Invalid credentials"}, status=400)

    # check if operator exists
    try:
        operator = Operator.objects.get(user=user)
    except Operator.DoesNotExist:
        return Response({"error": "Not an operator"}, status=403)
    refresh = RefreshToken.for_user(user)
    return Response(
        {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "username": user.username,
            "company_name": operator.company_name,
            "operator_key": str(operator.operator_key),
        }
    )


# operator Logout view
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def logout_operator(request):
    try:
        refresh_token = request.data.get("refresh")
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response(
            {"message": "Operator logged out successfully"},
            status=status.HTTP_205_RESET_CONTENT,
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

#get all operators
@api_view(["GET"])
@permission_classes([IsAuthenticated,IsAdminUser])
def get_all_operators(request):
    operators=Operator.objects.all()
    serializer=OperatorSerializer(operators,many=True)
    return Response(serializer.data,status=status.HTTP_200_OK)

# Edit and delete operator
@api_view(["PUT", "DELETE"])
@permission_classes([IsAuthenticated, IsAdminUser])
def manage_operator(request, operator_id):
    try:
        operator = Operator.objects.get(id=operator_id)
    except Operator.DoesNotExist:
        return Response({"error": "Operator not found"}, status=404)
    user = operator.user  # realted user object

    # Update operator details
    if request.method == "PUT":
        username = request.data.get("username")
        company_name = request.data.get("company_name")
        phone = request.data.get("phone")
        new_password = request.data.get("password")  # NEW FIELD

        # update username
        if username:
            user.username = username
        # update password if securely
        if new_password:
            user.set_password(new_password)
        user.save()
        # Update opeator profile
        if company_name:
            operator.company_name = company_name
        if phone:
            operator.phone = phone
        operator.save()
        return Response(
            {
                "message": "Operator updated successfully",
                "operator_id": operator_id,
                "username": user.username,
                "company_name": operator.company_name,
                "phone": operator.phone,
            }
        )
    # Delete operator
    elif request.method == "DELETE":
        user.delete()
        return Response(
            {"message": "Operator deleted successfully"},
            status=status.HTTP_204_NO_CONTENT,
        )
