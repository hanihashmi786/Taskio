from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['POST'])
def signup(request):
    # Your signup logic here
    return Response({"message": "Signup endpoint"})

@api_view(['POST'])
def login(request):
    # Your login logic here
    return Response({"message": "Login endpoint"})
