from django.urls import path
from . import views

urlpatterns = [
    # User Routes
    path("register/", views.register_user, name="register"),
    path("login/", views.login_user, name="login"),
    path("logout/", views.logout_user, name="logout"),
    # Admin Routes
    path("admin/register/", views.register_admin, name="admin-register"),
    path("admin/login/", views.login_admin, name="admin-login"),
    path("admin/logout/", views.logout_admin, name="admin-logout"),
    # Operator Routes
    path("operator/register/", views.create_operator, name="operator-register"),
    # Get all operators
    path("operators/", views.get_all_operators, name="get-all-operators"),
    # manage operator
    path("operator/<int:operator_id>/", views.manage_operator, name="manage-operator"),
    path("operator/login/", views.login_operator, name="operator-login"),
    path("operator/logout/", views.logout_operator, name="operator-logout"),
]
