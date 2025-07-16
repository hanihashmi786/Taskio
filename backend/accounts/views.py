from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import UserProfileSerializer
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.db.models import Q
from kanban.models import Board, BoardMembership

# --- SIGNUP ---
@api_view(['POST'])
def signup(request):
    User = get_user_model()
    first_name = request.data.get('first_name', '')
    last_name = request.data.get('last_name', '')
    email = request.data.get('email', '')
    password = request.data.get('password', '')
    confirm_password = request.data.get('confirmPassword', '')

    # Validation...
    # (same as before, check for all fields)

    if not first_name or not last_name or not email or not password or not confirm_password:
        return Response({'error': 'All fields are required.'}, status=status.HTTP_400_BAD_REQUEST)
    # ... rest of your validation

    username_base = email.split('@')[0]
    username = username_base
    counter = 1
    while User.objects.filter(username=username).exists():
        username = f"{username_base}{counter}"
        counter += 1
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=first_name,
        last_name=last_name
    )
    return Response({'message': 'User created successfully!'}, status=status.HTTP_201_CREATED)


# --- LOGIN ---
@api_view(['POST'])
def login(request):
    email = request.data.get('email', '')
    password = request.data.get('password', '')
    User = get_user_model()

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return Response({'error': 'Invalid email or password.'}, status=status.HTTP_400_BAD_REQUEST)

    user = authenticate(request, username=user.username, password=password)
    if user is not None:
        refresh = RefreshToken.for_user(user)
        return Response({
            'access_token': str(refresh.access_token),
            'refresh_token': str(refresh),
            'user': {
                'id': user.id,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email,
            },
            'message': 'Login successful!'
        })
    else:
        return Response({'error': 'Invalid email or password.'}, status=status.HTTP_400_BAD_REQUEST)

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserProfileSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        # Use request.FILES for avatar if present
        data = request.data.copy()
        if 'avatar' in request.FILES:
            data['avatar'] = request.FILES['avatar']
        serializer = UserProfileSerializer(request.user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# --- SEARCH USERS FOR ADDING TO BOARD ---
class UserSearchAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        query = request.GET.get('q', '').strip()
        board_id = request.GET.get('board')
        User = get_user_model()
        users = User.objects.all().exclude(id=request.user.id)

        if query:
            users = users.filter(
                Q(first_name__icontains=query) |
                Q(last_name__icontains=query) |
                Q(email__icontains=query)
            )

        if board_id:
            from kanban.models import BoardMembership
            board_members = BoardMembership.objects.filter(board_id=board_id).values_list('user_id', flat=True)
            users = users.exclude(id__in=board_members)

        users = users.order_by('first_name', 'last_name')[:20]
        return Response([
            {
                "id": u.id,
                "first_name": u.first_name,
                "last_name": u.last_name,
                "email": u.email,
                # Fix: always return avatar as URL or empty string
                "avatar": u.avatar.url if getattr(u, 'avatar', None) and hasattr(u.avatar, 'url') else "",
            } for u in users
        ])


# --- ADD USER TO BOARD ---
class AddBoardMemberAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from kanban.models import Board, BoardMembership

        board_id = request.data.get('board_id')
        user_id = request.data.get('user_id')
        role = request.data.get('role', 'member')  # default: member

        if not board_id or not user_id:
            return Response({'error': 'board_id and user_id required.'}, status=400)
        try:
            board = Board.objects.get(id=board_id)
        except Board.DoesNotExist:
            return Response({'error': 'Board not found.'}, status=404)

        # Only allow owners or admins to add members!
        try:
            bm = BoardMembership.objects.get(board=board, user=request.user)
        except BoardMembership.DoesNotExist:
            return Response({'error': 'Not a board member.'}, status=403)
        if bm.role not in ['owner', 'admin']:
            return Response({'error': 'Only board owner or admin can add members.'}, status=403)

        User = get_user_model()
        try:
            user = User.objects.get(id=user_id)
        except User.DoesNotExist:
            return Response({'error': 'User not found.'}, status=404)

        if BoardMembership.objects.filter(board=board, user=user).exists():
            return Response({'error': 'User is already a member.'}, status=409)

        if role not in ['member', 'admin']:
            role = 'member'

        BoardMembership.objects.create(board=board, user=user, role=role)
        return Response({'success': True, 'message': 'User added to board.'})

class UpdateBoardMemberRoleAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        board_id = request.data.get("board_id")
        member_id = request.data.get("member_id")
        role = request.data.get("role")

        if not board_id or not member_id or not role:
            return Response({"error": "Missing required fields."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            board = Board.objects.get(id=board_id)
        except Board.DoesNotExist:
            return Response({"error": "Board does not exist."}, status=status.HTTP_404_NOT_FOUND)

        # Only owner or admin can change roles
        try:
            acting_membership = BoardMembership.objects.get(board=board, user=request.user)
        except BoardMembership.DoesNotExist:
            return Response({"error": "Not a board member."}, status=status.HTTP_403_FORBIDDEN)

        if acting_membership.role not in ["owner", "admin"]:
            return Response({"error": "Only owner or admin can change roles."}, status=status.HTTP_403_FORBIDDEN)

        # You cannot demote the only owner!
        member_membership = BoardMembership.objects.filter(board=board, user_id=member_id).first()
        if not member_membership:
            return Response({"error": "That member is not part of this board."}, status=status.HTTP_404_NOT_FOUND)

        # Prevent removing the last owner
        if member_membership.role == "owner" and role != "owner":
            owner_count = BoardMembership.objects.filter(board=board, role="owner").count()
            if owner_count <= 1:
                return Response({"error": "Cannot remove the only owner!"}, status=status.HTTP_400_BAD_REQUEST)

        member_membership.role = role
        member_membership.save()

        return Response({"message": "Role updated successfully!"})