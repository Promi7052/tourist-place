from django.urls import path

from api.views import PlaceAPIView, PlaceDetailAPIView

urlpatterns = [
    path("place", PlaceAPIView.as_view()),
    path('places/<int:place_id>/', PlaceDetailAPIView.as_view(), name='places-detail'),
]
