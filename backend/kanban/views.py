from rest_framework import viewsets, permissions
from .models import Board
from .serializers import BoardSerializer

class BoardViewSet(viewsets.ModelViewSet):
    serializer_class = BoardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Board.objects.filter(members=self.request.user)
    
    def perform_create(self, serializer):
        board = serializer.save(created_by=self.request.user)
        board.members.add(self.request.user)  # Add creator as member
