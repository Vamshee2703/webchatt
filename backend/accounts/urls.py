from django.urls import path
from .views import signup, employee_me, copilot, chat_history, crawl_website

urlpatterns = [
    path("signup/", signup),
    path("employee/me/", employee_me),
    path("copilot/", copilot),
    path("copilot/history/", chat_history),

    # NEW
    path("crawl/", crawl_website),
]