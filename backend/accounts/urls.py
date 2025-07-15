from django.urls import path
from .views import signup, login
from .views import ProfileView, UserSearchAPIView, AddBoardMemberAPIView, UpdateBoardMemberRoleAPIView

urlpatterns = [
    path('signup/', signup, name='signup'),
    path('login/', login, name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('search-users/', UserSearchAPIView.as_view(), name='user-search'),
    path('add-board-member/', AddBoardMemberAPIView.as_view(), name='add-board-member'),
    path('update-member-role/', UpdateBoardMemberRoleAPIView.as_view(), name='update-member-role'),

]

