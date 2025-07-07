from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import get_user_model, authenticate
from rest_framework_simplejwt.tokens import RefreshToken

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

    username = email.split('@')[0]
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
