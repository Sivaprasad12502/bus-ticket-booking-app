from firebase_admin import auth as firebase_auth
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from .models import User, Operator
from .serializers import UserSerializer, AdminUserSerializer, OperatorSerializer

#password reset imports
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_str, smart_bytes
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from django.core.mail import send_mail

token_generator=PasswordResetTokenGenerator()


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
            "company_name": company_name,
            "id": operator.id,
            "is_staff": user.is_staff,
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
            "id": operator.id,
            "is_staff": user.is_staff,
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


# get all operators
@api_view(["GET"])
@permission_classes([IsAuthenticated, IsAdminUser])
def get_all_operators(request):
    operators = Operator.objects.all()
    serializer = OperatorSerializer(operators, many=True)
    return Response(serializer.data, status=status.HTTP_200_OK)


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


## google oauth login
GOOGLE_CLIENT_ID = (
    "976665168973-8rkgfiq42sv42ncot93s7eokguikdp2s.apps.googleusercontent.com"
)


@api_view(["POST"])
@permission_classes([AllowAny])
def google_register(request):
    try:
        id_token = request.data.get("id_token")
        if not id_token:
            return Response({"error": "ID token is required"}, status=400)
        # Firebase token verification
        decoded = firebase_auth.verify_id_token(id_token)
        email = decoded.get("email")
        name = decoded.get("name", "")
        # Check if user already exists
        if User.objects.filter(email=email).exists():
            return Response(
                {"error": "User already registered. Please Login"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        # Create new user
        user = User.objects.create_user(
            username=name, email=email, first_name=name, password=None
        )
        user.set_unusable_password()
        user.save()
        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "message": " Registration successful",
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "email": user.email,
                "username": user.username,
            },
            status=status.HTTP_201_CREATED,
        )
    except Exception as e:
        return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


# google oauth login
@api_view(["POST"])
@permission_classes([AllowAny])
def google_login(request):
    try:
        id_token = request.data.get("id_token")
        if not id_token:
            return Response({"error": "Id token  missing"}, status=400)
        decoded = firebase_auth.verify_id_token(id_token)
        email = decoded.get("email")
        # Check if user exists
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response(
                {"error": "User not registered. Please register first. "},
                status=status.HTTP_404_NOT_FOUND,
            )
        # Login give jwt
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "message": "Google Login Successful",
                "refresh": str(refresh),
                "access": str(refresh.access_token),
                "email": user.email,
                "username": user.username,
            },
            status=200,
        )
    except Exception as e:
        return Response({"error": str(e)}, status=400)
    

#password reset views
# SEND RESET LINK
@api_view(["POST"])
@permission_classes([AllowAny])
def send_password_reset_email(request):
    email=request.data.get("email")
    if not User.objects.filter(email=email).exists():
        return Response({"error":"Email not found"}, status=400)
    user =User.objects.get(email=email)
    uid=urlsafe_base64_encode(smart_bytes(user.id))
    token=token_generator.make_token(user)
    reset_link=f"http://localhost:5173/reset-password/{uid}/{token}"

    send_mail(
        "Reset Your Password",
        f"Click the link to reset your password: {reset_link}",
        "noreply@example.com",
        [email],
        fail_silently=False,
    )
    return Response({"message": "Password reset link  sent to email"}, status=200)

# Vrify token
@api_view(["GET"])
@permission_classes([AllowAny])
def verify_password_reset_token(request, uidb64, token):
    try:
        uid=force_str(urlsafe_base64_decode(uidb64))
        user=User.objects.get(id=uid)
        if token_generator.check_token(user, token):
            return Response({"Valid":True})
        else:
            return Response({"valid":False}, status=400)
    except Exception:
        return Response({"valid":False}, status=400)

# set new password
@api_view(["POST"])
@permission_classes([AllowAny])
def reset_password(request):
    uidb64=request.data.get("uidb64")
    token=request.data.get("token")
    password=request.data.get("password")
    try:
        uid=force_str(urlsafe_base64_decode(uidb64))
        user=User.objects.get(id=uid)
        if not token_generator.check_token(user,token):
           return Response({"error":"Invalid token"}, status=400)
        user.set_password(password)
        user.save()
        return Response({"message":"Password reset successful"})
    except Exception:
        return Response({"error":"invalid request"}, status=400)