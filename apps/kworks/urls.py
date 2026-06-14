from django.urls import path
from .views import KworkCreateView, KworkDetailView, KworkUpdateView, KworkListView

urlpatterns = [
    path('kwork/<uuid:uuid>/',KworkDetailView.as_view()),
    path('kwork/create/',KworkCreateView.as_view()),
    path('kwork/update/<uuid:uuid>/',KworkUpdateView.as_view()),
    path('kworks/',KworkListView.as_view())
]
