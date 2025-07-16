from django.urls import path
from .views import (
    BoardAPI, ListAPI, CardAPI, LabelAPI, ChecklistAPI, ChecklistItemAPI, CommentAPI, AttachmentAPI
)

urlpatterns = [
    path('boards/', BoardAPI.as_view(), name='board-list'),
    path('boards/<int:id>/', BoardAPI.as_view(), name='board-detail'),
    path('lists/', ListAPI.as_view(), name='list-list'),
    path('lists/<int:id>/', ListAPI.as_view(), name='list-detail'),
    path('cards/', CardAPI.as_view(), name='card-list'),
    path('cards/<int:id>/', CardAPI.as_view(), name='card-detail'),
    path('labels/', LabelAPI.as_view(), name='label-list'),
    path('checklists/', ChecklistAPI.as_view(), name='checklist-list'),
    path('checklist-items/', ChecklistItemAPI.as_view(), name='checklistitem-list'),
    path('checklist-items/<int:id>/', ChecklistItemAPI.as_view(), name='checklistitem-detail'),
    path('comments/', CommentAPI.as_view(), name='comment-list'),
    path('attachments/', AttachmentAPI.as_view(), name='attachment-list'),
]
