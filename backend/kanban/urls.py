from rest_framework.routers import DefaultRouter
from .views import BoardViewSet, ListViewSet, CardViewSet, ChecklistViewSet, ChecklistItemViewSet, CommentViewSet, LabelViewSet

router = DefaultRouter()
router.register(r'boards', BoardViewSet, basename='board')
router.register(r'lists', ListViewSet, basename='list')
router.register(r'cards', CardViewSet, basename='card')
router.register(r'labels', LabelViewSet)
router.register(r'checklists', ChecklistViewSet)
router.register(r'checklist-items', ChecklistItemViewSet)
router.register(r'comments', CommentViewSet)

urlpatterns = router.urls
