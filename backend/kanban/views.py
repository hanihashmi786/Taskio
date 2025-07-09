from rest_framework import viewsets, permissions
from .models import Board, List, Card, BoardMembership, Checklist, ChecklistItem, Comment, Label
from .serializers import BoardSerializer, ListSerializer, CardSerializer, ChecklistSerializer, ChecklistItemSerializer, CommentSerializer, LabelSerializer
class BoardViewSet(viewsets.ModelViewSet):
    serializer_class = BoardSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Board.objects.filter(members=self.request.user)
    
    def perform_create(self, serializer):
        board = serializer.save(created_by=self.request.user)
        board.members.add(self.request.user)  # Add creator as member

class ListViewSet(viewsets.ModelViewSet):
    serializer_class = ListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Optionally filter by board with a query param
        board_id = self.request.query_params.get("board")
        qs = List.objects.all()
        if board_id:
            qs = qs.filter(board_id=board_id)
        return qs

    def perform_create(self, serializer):
        # board must be sent from frontend
        serializer.save()

    def get_queryset(self):
        queryset = List.objects.all()
        board_id = self.request.query_params.get("board")
        if board_id:
            queryset = queryset.filter(board_id=board_id)
        return queryset.order_by("order", "id")

class CardViewSet(viewsets.ModelViewSet):
    serializer_class = CardSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Card.objects.all()

    def get_queryset(self):
        queryset = Card.objects.all()
        list_id = self.request.query_params.get("list")
        if list_id:
            queryset = queryset.filter(list_id=list_id)
        return queryset.order_by("order", "id")

class CardViewSet(viewsets.ModelViewSet):
    serializer_class = CardSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Card.objects.all()

    def perform_create(self, serializer):
        card = serializer.save()

class ChecklistViewSet(viewsets.ModelViewSet):
    serializer_class = ChecklistSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Checklist.objects.all()

class ChecklistItemViewSet(viewsets.ModelViewSet):
    serializer_class = ChecklistItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = ChecklistItem.objects.all()

class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Comment.objects.all()

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)

class LabelViewSet(viewsets.ModelViewSet):
    queryset = Label.objects.all()
    serializer_class = LabelSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Optionally, only return labels for boards the user is a member of
        board_id = self.request.query_params.get("board")
        qs = Label.objects.all()
        if board_id:
            qs = qs.filter(board_id=board_id)
        return qs