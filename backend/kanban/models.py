from django.db import models
from django.conf import settings

User = settings.AUTH_USER_MODEL

class Board(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    color = models.CharField(max_length=30, default="bg-blue-500")
    icon = models.CharField(max_length=10, default="📋")
    created_by = models.ForeignKey(User, related_name="created_boards", on_delete=models.CASCADE)
    members = models.ManyToManyField(User, through="BoardMembership", related_name="boards")
    created_at = models.DateTimeField(auto_now_add=True)

class BoardMembership(models.Model):
    ROLE_CHOICES = (
        ('owner', 'Owner'),
        ('admin', 'Admin'),
        ('member', 'Member'),
    )
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    board = models.ForeignKey(Board, on_delete=models.CASCADE)
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='member')
    added_at = models.DateTimeField(auto_now_add=True)


class Label(models.Model):
    name = models.CharField(max_length=50)
    color = models.CharField(max_length=30, default="bg-blue-500")
    text_color = models.CharField(max_length=30, default="text-white")
    board = models.ForeignKey('Board', related_name='labels', on_delete=models.CASCADE)

    def __str__(self):
        return self.name

class List(models.Model):
    board = models.ForeignKey(Board, related_name='lists', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

class Card(models.Model):
    list = models.ForeignKey('List', related_name='cards', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    due_date = models.DateField(null=True, blank=True)
    order = models.PositiveIntegerField(default=0)
    assignees = models.ManyToManyField(User, blank=True, related_name='assigned_cards')
    labels = models.ManyToManyField(Label, blank=True, related_name='cards')  # <-- NEW LINE!
    created_at = models.DateTimeField(auto_now_add=True)

class Checklist(models.Model):
    card = models.ForeignKey(Card, related_name='checklists', on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

class ChecklistItem(models.Model):
    checklist = models.ForeignKey(Checklist, related_name='items', on_delete=models.CASCADE)
    text = models.CharField(max_length=255)
    completed = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

class Comment(models.Model):
    card = models.ForeignKey(Card, related_name='comments', on_delete=models.CASCADE)
    author = models.ForeignKey(User, related_name="comments", on_delete=models.CASCADE)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)


