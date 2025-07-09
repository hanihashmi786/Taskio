from django.urls import path
from .views import signup, login
from .views import ProfileView

urlpatterns = [
    path('signup/', signup, name='signup'),
    path('login/', login, name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),

]
