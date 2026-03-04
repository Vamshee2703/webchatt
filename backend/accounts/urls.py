from django.urls import path
from .views import signup, employee_me
from .views import copilot,chat_history
urlpatterns = [
    path("signup/", signup),
    path("employee/me/", employee_me),
    path("copilot/", copilot),
    path("copilot/history/", chat_history),

]
