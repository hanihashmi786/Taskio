from rest_framework import serializers
from .models import Board, List, Card, Checklist, ChecklistItem, Comment, BoardMembership, Label
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "email")

class BoardMembershipSerializer(serializers.ModelSerializer):
    user = UserSerializer()
    class Meta:
        model = BoardMembership
        fields = ['user', 'role', 'added_at']

class ChecklistItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChecklistItem
        fields = "__all__"

class ChecklistSerializer(serializers.ModelSerializer):
    items = ChecklistItemSerializer(many=True, read_only=True)

    class Meta:
        model = Checklist
        fields = "__all__"

class CommentSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    class Meta:
        model = Comment
        fields = "__all__"

class LabelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Label
        fields = "__all__"

class CardSerializer(serializers.ModelSerializer):
    checklists = ChecklistSerializer(many=True, read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    assignees = UserSerializer(many=True, read_only=True)
    labels = LabelSerializer(many=True, read_only=True)      # For GET (read)
    label_ids = serializers.PrimaryKeyRelatedField(          # For POST/PUT
        many=True, write_only=True, required=False, queryset=Label.objects.all(), source='labels'
    )

    class Meta:
        model = Card
        fields = "__all__"

class ListSerializer(serializers.ModelSerializer):
    cards = CardSerializer(many=True, read_only=True)
    class Meta:
        model = List
        fields = "__all__"

class BoardSerializer(serializers.ModelSerializer):
    lists = ListSerializer(many=True, read_only=True)
    memberships = BoardMembershipSerializer(source='boardmembership_set', many=True, read_only=True)

    class Meta:
        model = Board
        fields = "__all__"
