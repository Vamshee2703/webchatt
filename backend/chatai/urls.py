from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
def home(request):
    return HttpResponse("🚀 Backend is running!")
urlpatterns = [
    path('', home),
    path('admin/', admin.site.urls),

    # AUTH
    path('api/login/', TokenObtainPairView.as_view(), name='login'),
    path('api/refresh/', TokenRefreshView.as_view(), name='refresh'),

    # ACCOUNTS
    path('api/', include('accounts.urls')),
]
