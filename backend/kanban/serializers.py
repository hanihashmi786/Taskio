from rest_framework import serializers
from .models import Board, List, Card, Checklist, ChecklistItem, Comment, Label, BoardMembership, Attachment
from django.contrib.auth import get_user_model
from accounts.serializers import UserProfileSerializer

class ChecklistItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChecklistItem
        fields = ["id", "checklist", "text", "completed", "created_at"]
        read_only_fields = ["id", "created_at"]

class ChecklistSerializer(serializers.ModelSerializer):
    items = ChecklistItemSerializer(many=True, required=False)
    class Meta:
        model = Checklist
        fields = ["id", "card", "title", "items", "created_at"]
        read_only_fields = ["id", "created_at"]

    def create(self, validated_data):
        items_data = validated_data.pop('items', [])
        checklist = Checklist.objects.create(**validated_data)
        for item_data in items_data:
            ChecklistItem.objects.create(checklist=checklist, **item_data)
        return checklist

class CommentSerializer(serializers.ModelSerializer):
    author = UserProfileSerializer(read_only=True)
    class Meta:
        model = Comment
        fields = ["id", "card", "author", "text", "created_at"]
        read_only_fields = ["id", "author", "created_at"]

    def create(self, validated_data):
        comment = Comment.objects.create(**validated_data)
        # --- Mention notification logic ---
        import re
        from django.contrib.auth import get_user_model
        from .models import Notification
        User = get_user_model()
        mentioned_usernames = set(re.findall(r"@([\w\-_.]+)", comment.text))
        for username in mentioned_usernames:
            try:
                user = User.objects.get(username=username)
                if user != comment.author:
                    Notification.objects.create(
                        user=user,
                        message=f'You were mentioned in a comment on card "{comment.card.title}"',
                        type='mention',
                        card=comment.card,
                        board=comment.card.list.board
                    )
            except User.DoesNotExist:
                continue
        return comment

class AttachmentSerializer(serializers.ModelSerializer):
    uploaded_by = serializers.StringRelatedField(read_only=True)
    file_size = serializers.SerializerMethodField()
    uploaded_at_formatted = serializers.SerializerMethodField()

    class Meta:
        model = Attachment
        fields = ["id", "card", "file", "uploaded_by", "uploaded_at", "file_size", "uploaded_at_formatted"]
        read_only_fields = ["id", "uploaded_by", "uploaded_at"]

    def get_file_size(self, obj):
        try:
            if obj.file and hasattr(obj.file, 'size'):
                return obj.file.size
            return None
        except:
            return None

    def get_uploaded_at_formatted(self, obj):
        if obj.uploaded_at:
            return obj.uploaded_at.strftime("%Y-%m-%d %H:%M")
        return None

class CardSerializer(serializers.ModelSerializer):
    checklists = ChecklistSerializer(many=True, required=False)
    comments = CommentSerializer(many=True, required=False)
    assignees = serializers.PrimaryKeyRelatedField(many=True, queryset=get_user_model().objects.all(), required=False)
    labels = serializers.PrimaryKeyRelatedField(many=True, queryset=Label.objects.all(), required=False)
    attachments = serializers.SerializerMethodField()

    class Meta:
        model = Card
        fields = [
            "id", "list", "title", "description", "due_date", "order",
            "assignees", "labels", "created_at", "checklists", "comments", "attachments"
        ]
        read_only_fields = ["id", "created_at"]

    def get_attachments(self, obj):
        try:
            return AttachmentSerializer(obj.attachments.all(), many=True).data
        except:
            return []

    def create(self, validated_data):
        checklists_data = validated_data.pop('checklists', [])
        comments_data = validated_data.pop('comments', [])
        assignees = validated_data.pop('assignees', [])
        labels = validated_data.pop('labels', [])
        card = Card.objects.create(**validated_data)
        card.assignees.set(assignees)
        card.labels.set(labels)
        for checklist_data in checklists_data:
            items_data = checklist_data.pop('items', [])
            checklist = Checklist.objects.create(card=card, **checklist_data)
            for item_data in items_data:
                ChecklistItem.objects.create(checklist=checklist, **item_data)
        for comment_data in comments_data:
            Comment.objects.create(card=card, **comment_data)
        return card

    def update(self, instance, validated_data):
        checklists_data = validated_data.pop('checklists', [])
        comments_data = validated_data.pop('comments', [])
        assignees = validated_data.pop('assignees', None)
        labels = validated_data.pop('labels', None)

        # --- Mention notification logic for card description ---
        import re
        from django.contrib.auth import get_user_model
        from .models import Notification
        User = get_user_model()
        old_description = instance.description or ""
        new_description = validated_data.get('description', old_description)
        old_mentions = set(re.findall(r"@([\w\-_.]+)", old_description))
        new_mentions = set(re.findall(r"@([\w\-_.]+)", new_description))
        added_mentions = new_mentions - old_mentions
        for username in added_mentions:
            try:
                user = User.objects.get(username=username)
                Notification.objects.create(
                    user=user,
                    message=f'You were mentioned in the description of card "{instance.title}"',
                    type='mention',
                    card=instance,
                    board=instance.list.board
                )
            except User.DoesNotExist:
                continue

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        # --- Notification logic for new assignees ---
        if assignees is not None:
            old_assignees = set(instance.assignees.all())
            instance.assignees.set(assignees)
            new_assignees = set(instance.assignees.all())
            added_assignees = new_assignees - old_assignees
            for user in added_assignees:
                Notification.objects.create(
                    user=user,
                    message=f'You were assigned a new card: "{instance.title}"',
                    type='card_assigned',
                    card=instance,
                    board=instance.list.board
                )
        if labels is not None:
            instance.labels.set(labels)

        # Optionally handle updating checklists/comments here

        return instance

class ListSerializer(serializers.ModelSerializer):
    cards = CardSerializer(many=True, read_only=True)
    class Meta:
        model = List
        fields = ["id", "board", "title", "order", "created_at", "cards"]

class BoardSerializer(serializers.ModelSerializer):
    lists = serializers.SerializerMethodField()
    created_by = serializers.PrimaryKeyRelatedField(read_only=True)
    members = serializers.SerializerMethodField()
    icon = serializers.CharField(required=False, allow_blank=True, allow_null=True, default="")

    class Meta:
        model = Board
        fields = [
            "id", "title", "description", "color", "icon",
            "created_by", "created_at", "lists", "members", "background_theme"
        ]

    def get_lists(self, obj):
        from .serializers import ListSerializer  # avoid circular import if needed
        lists = obj.lists.all().order_by('order')
        return ListSerializer(lists, many=True).data

    def get_members(self, obj):
        memberships = BoardMembership.objects.filter(board=obj)
        return BoardMemberSerializer(memberships, many=True).data

class LabelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Label
        fields = "__all__"

class BoardMemberSerializer(serializers.ModelSerializer):
    first_name = serializers.SerializerMethodField()
    avatar = serializers.CharField(source='user.avatar', default="", read_only=True)
    email = serializers.CharField(source='user.email', default="", read_only=True)
    id = serializers.IntegerField(source='user.id', read_only=True)
    role = serializers.CharField(read_only=True)

    class Meta:
        model = BoardMembership
        fields = ['id', 'role', 'first_name', 'avatar', 'email']

    def get_first_name(self, obj):
        return obj.user.first_name or obj.user.username or "No Name"

# Notification serializer
from .models import Notification
from rest_framework import serializers

class NotificationSerializer(serializers.ModelSerializer):
    board_id = serializers.IntegerField(source='board.id', read_only=True)
    card_id = serializers.IntegerField(source='card.id', read_only=True)
    class Meta:
        model = Notification
        fields = '__all__'  # board and card are now included
