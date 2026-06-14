from django.urls import path
from .views import KworkCreateView, KworkDetailView, KworkUpdateView, KworkListView, PauseKworkView, ActivateKworkView, MYKworksView, KworkDeleteView

urlpatterns = [
    path('',KworkListView.as_view()),
    path('kwork/<uuid:uuid>/',KworkDetailView.as_view()),
    path('kwork/create/',KworkCreateView.as_view()),
    path('kwork/update/<uuid:uuid>/',KworkUpdateView.as_view()),
    path('kwork/pause/<uuid:uuid>/',PauseKworkView.as_view()),
    path('kwork/activate/<uuid:uuid>/',ActivateKworkView.as_view()),
    path('my/',MYKworksView.as_view()),
    path('kwork/<uuid:uuid>/delete/',KworkDeleteView.as_view())
]