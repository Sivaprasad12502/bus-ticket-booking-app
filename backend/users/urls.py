from django.urls import path
from . import views

urlpatterns = [

    #User Routes
    path('register/', views.register_user, name='register'),
    path('login/', views.login_user, name='login'),
    path('logout/', views.logout_user, name='logout'),

    #Admin Routes
    path("admin/register/",views.register_admin,name="admin-register"),
    path("admin/login/",views.login_admin,name='admin-login'),
    path("admin/logout/",views.logout_admin,name='admin-logout'),
]
