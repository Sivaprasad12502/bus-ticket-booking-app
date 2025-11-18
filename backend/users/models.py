from django.contrib.auth.models import AbstractUser
from django.db import models
import uuid

# Create your models here.

class User(AbstractUser):
    phone=models.CharField(max_length=15,blank=True)

#operator_model

class Operator(models.Model):
    user=models.OneToOneField(User, on_delete=models.CASCADE)
    company_name=models.CharField(max_length=200)
    phone=models.CharField(max_length=15)
    operator_key=models.UUIDField(default=uuid.uuid4,unique=True)
    
    def __str__(self):
        return self.company_name