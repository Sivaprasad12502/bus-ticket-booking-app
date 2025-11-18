from rest_framework import serializers
from .models import User,Operator
from django.contrib.auth.password_validation import validate_password
from rest_framework.validators import UniqueValidator
class UserSerializer(serializers.ModelSerializer):
    password=serializers.CharField(write_only=True,required=True,validators=[validate_password])
    password2=serializers.CharField(write_only=True,required=True)
    email=serializers.EmailField(
        required=True,
        validators=[UniqueValidator(queryset=User.objects.all())]
    )
    class Meta:
        model=User
        fields=["id",'username','email','password','password2','phone']
    def validate(self,attrs):
        if attrs['password']!=attrs['password2']:
            raise serializers.ValidationError({"password":"Password fields didn't match."})
        return attrs

    def create(self,validated_data):
        validated_data.pop('password2',None)
        user=User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email'),
            password=validated_data['password'],
            phone=validated_data.get('phone',''),
        )
        return user
    
class AdminUserSerializer(serializers.ModelSerializer):
    password=serializers.CharField(write_only=True,required=True,validators=[validate_password])
    class Meta:
        model=User
        fields=["id","username","email","password"]
    def create(self,validated_data):
        user=User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email",""),
            password=validated_data["password"],

        )
        user.is_staff=True
        user.is_superuser=True
        user.save()
        return user


class OperatorSerializer(serializers.ModelSerializer):
     username=serializers.CharField(source="user.username",read_only=True)
     class Meta:
         model=Operator
         fields = ["id", "company_name", "operator_key", "phone", "username", "user"]
         