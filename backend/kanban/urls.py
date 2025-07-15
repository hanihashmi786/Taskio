from django.urls import path
from .views import (
    BoardAPI, ListAPI, CardAPI, LabelAPI, ChecklistAPI, ChecklistItemAPI, CommentAPI
)

urlpatterns = [
    path('boards/', BoardAPI.as_view(), name='board-list'),
    path('lists/', ListAPI.as_view(), name='list-list'),
    path('cards/', CardAPI.as_view(), name='card-list'),
    path('cards/<int:id>/', CardAPI.as_view(), name='card-detail'),
    path('labels/', LabelAPI.as_view(), name='label-list'),
    path('checklists/', ChecklistAPI.as_view(), name='checklist-list'),
    path('checklist-items/', ChecklistItemAPI.as_view(), name='checklistitem-list'),
    path('comments/', CommentAPI.as_view(), name='comment-list'),
]
