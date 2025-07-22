from django.contrib import admin
from .models import Board, BoardMembership, List, Card, Checklist, ChecklistItem, Comment, Label, Notification

admin.site.register(Board)
admin.site.register(BoardMembership)
admin.site.register(List)

class CardAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'list', 'order', 'created_at')  # Add other fields as needed

admin.site.register(Card, CardAdmin)

admin.site.register(Checklist)
admin.site.register(ChecklistItem)
admin.site.register(Comment)

class LabelAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'color', 'text_color', 'board')

admin.site.register(Label, LabelAdmin)

admin.site.register(Notification)
