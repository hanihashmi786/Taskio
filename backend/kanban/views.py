from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Board, List, Card, Label, Checklist, ChecklistItem, Comment, BoardMembership, Attachment
from .serializers import (
    BoardSerializer, ListSerializer, CardSerializer,
    LabelSerializer, ChecklistSerializer, ChecklistItemSerializer, CommentSerializer, AttachmentSerializer,
)
from django.shortcuts import get_object_or_404

# ------------------- BOARD -------------------
class BoardAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id=None):
        if id is not None:
            board = get_object_or_404(Board, id=id, members=request.user)
            serializer = BoardSerializer(board)
            return Response(serializer.data)
        boards = Board.objects.filter(members=request.user)
        serializer = BoardSerializer(boards, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = BoardSerializer(data=request.data)
        if serializer.is_valid():
            board = serializer.save(created_by=request.user)
            BoardMembership.objects.create(board=board, user=request.user, role="owner")
            return Response(BoardSerializer(board).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, id=None):
        board_id = id or request.data.get("id")
        board = get_object_or_404(Board, id=board_id)
        serializer = BoardSerializer(board, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, id=None):
        board_id = id or request.data.get("id")
        board = get_object_or_404(Board, id=board_id)
        serializer = BoardSerializer(board, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id=None):
        board_id = id or request.data.get('id') or request.query_params.get('id')
        if not board_id:
            return Response({'detail': 'Board id required.'}, status=status.HTTP_400_BAD_REQUEST)
        board = get_object_or_404(Board, pk=board_id)
        board.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# ------------------- LIST -------------------
class ListAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        board_id = request.query_params.get('board')
        lists = List.objects.filter(board_id=board_id) if board_id else List.objects.all()
        serializer = ListSerializer(lists, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = ListSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, id=None):
        list_id = id or request.data.get("id")
        list_obj = get_object_or_404(List, id=list_id)
        serializer = ListSerializer(list_obj, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, id=None):
        list_id = id or request.data.get("id")
        list_obj = get_object_or_404(List, id=list_id)
        serializer = ListSerializer(list_obj, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id=None):
        list_id = id or request.data.get('id') or request.query_params.get('id')
        if not list_id:
            return Response({'detail': 'List id required.'}, status=status.HTTP_400_BAD_REQUEST)
        list_obj = get_object_or_404(List, pk=list_id)
        list_obj.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# ------------------- CARD -------------------
class CardAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, id=None):
        if id is not None:
            card = get_object_or_404(Card, id=id)
            serializer = CardSerializer(card)
            return Response(serializer.data)
        list_id = request.query_params.get('list')
        cards = Card.objects.filter(list_id=list_id) if list_id else Card.objects.all()
        serializer = CardSerializer(cards, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CardSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, id=None):
        card_id = id or request.data.get("id")
        card = get_object_or_404(Card, id=card_id)
        serializer = CardSerializer(card, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, id=None):
        card_id = id or request.data.get("id")
        card = get_object_or_404(Card, id=card_id)
        serializer = CardSerializer(card, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id=None):
        card_id = id or request.data.get('id') or request.query_params.get('id')
        if not card_id:
            return Response({'detail': 'Card id required.'}, status=status.HTTP_400_BAD_REQUEST)
        card = get_object_or_404(Card, pk=card_id)
        card.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# ------------------- LABEL -------------------
class LabelAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        board_id = request.query_params.get('board')
        labels = Label.objects.filter(board_id=board_id) if board_id else Label.objects.all()
        serializer = LabelSerializer(labels, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = LabelSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        label_id = request.data.get('id') or request.query_params.get('id')
        if not label_id:
            return Response({'detail': 'Label id required.'}, status=status.HTTP_400_BAD_REQUEST)
        label = get_object_or_404(Label, pk=label_id)
        label.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# ------------------- CHECKLIST -------------------
class ChecklistAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        card_id = request.query_params.get('card')
        checklists = Checklist.objects.filter(card_id=card_id) if card_id else Checklist.objects.all()
        serializer = ChecklistSerializer(checklists, many=True)
        return Response(serializer.data)

    def post(self, request):
        data = request.data.copy()
        data['card_id'] =  data['card']
        data['card'] =  data['card']
        serializer = ChecklistSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        checklist_id = request.data.get('id') or request.query_params.get('id')
        if not checklist_id:
            return Response({'detail': 'Checklist id required.'}, status=status.HTTP_400_BAD_REQUEST)
        checklist = get_object_or_404(Checklist, pk=checklist_id)
        checklist.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# ------------------- CHECKLIST ITEM -------------------
class ChecklistItemAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        checklist_id = request.query_params.get('checklist')
        items = ChecklistItem.objects.filter(checklist_id=checklist_id) if checklist_id else ChecklistItem.objects.all()
        serializer = ChecklistItemSerializer(items, many=True)
        return Response(serializer.data)

    def post(self, request):
        # checklist_id must be passed!
        serializer = ChecklistItemSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, id=None):
        item_id = id or request.data.get("id")
        item = get_object_or_404(ChecklistItem, id=item_id)
        serializer = ChecklistItemSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, id=None):
        item_id = id or request.data.get("id")
        item = get_object_or_404(ChecklistItem, id=item_id)
        serializer = ChecklistItemSerializer(item, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, id=None):
        item_id = id or request.data.get('id') or request.query_params.get('id')
        if not item_id:
            return Response({'detail': 'ChecklistItem id required.'}, status=status.HTTP_400_BAD_REQUEST)
        item = get_object_or_404(ChecklistItem, pk=item_id)
        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# ------------------- COMMENT -------------------
class CommentAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        card_id = request.query_params.get('card')
        comments = Comment.objects.filter(card_id=card_id) if card_id else Comment.objects.all()
        serializer = CommentSerializer(comments, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CommentSerializer(data=request.data)
        if serializer.is_valid():
            # Save with user as author, and return author full name
            comment = serializer.save(author=request.user)
            data = serializer.data
            data["author_name"] = f"{request.user.first_name} {request.user.last_name}".strip()
            return Response(data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        comment_id = request.data.get('id') or request.query_params.get('id')
        if not comment_id:
            return Response({'detail': 'Comment id required.'}, status=status.HTTP_400_BAD_REQUEST)
        comment = get_object_or_404(Comment, pk=comment_id)
        comment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

# ------------------- ATTACHMENT -------------------
class AttachmentAPI(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        card_id = request.query_params.get('card')
        if not card_id:
            return Response({'detail': 'card id required'}, status=status.HTTP_400_BAD_REQUEST)
        attachments = Attachment.objects.filter(card_id=card_id)
        serializer = AttachmentSerializer(attachments, many=True)
        return Response(serializer.data)

    def post(self, request):
        card_id = request.data.get('card')
        file = request.FILES.get('file')
        if not card_id or not file:
            return Response({'detail': 'card and file required'}, status=status.HTTP_400_BAD_REQUEST)
        data = {'card': card_id, 'file': file}
        serializer = AttachmentSerializer(data=data)
        if serializer.is_valid():
            serializer.save(uploaded_by=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request):
        attachment_id = request.data.get('id') or request.query_params.get('id')
        if not attachment_id:
            return Response({'detail': 'Attachment id required.'}, status=status.HTTP_400_BAD_REQUEST)
        attachment = get_object_or_404(Attachment, pk=attachment_id)
        if attachment.uploaded_by != request.user:
            return Response({'detail': 'Not allowed.'}, status=status.HTTP_403_FORBIDDEN)
        attachment.file.delete(save=False)
        attachment.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
