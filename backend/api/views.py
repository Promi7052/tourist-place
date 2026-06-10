from pydantic import ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.views import APIView
from rest_framework.response import Response
from drf_spectacular.utils import OpenApiParameter, OpenApiResponse, extend_schema

from api.models import Place
from api.schemas import PlaceCreateSchema, PlaceResponseSchema, PlaceUpdateSchema
from core.database import get_db
from rest_framework.status import HTTP_200_OK, HTTP_201_CREATED, HTTP_204_NO_CONTENT, HTTP_400_BAD_REQUEST, HTTP_404_NOT_FOUND

from user_management.utils.permissions import IsCreatorOrReadOnly
from .mixins import PaginationnSortingMixin


class PlaceAPIView(APIView, PaginationnSortingMixin):
    def get_permissions(self):
        """Maps HTTP methods to their required permission states cleanly."""
        if self.request.method == 'GET':
            return [AllowAny()]
        if self.request.method == 'POST':
            return [IsAuthenticated()]
        return super().get_permissions()

    @extend_schema(
        parameters=[
            OpenApiParameter(name="page", type=int, description="Page number (default: 1)", default=1),
            OpenApiParameter(name="page_size", type=int, description="Items per page (default: 10)", default=10),
            OpenApiParameter(name="sort_by", type=str, description="Field to sort by", default="id"),
            OpenApiParameter(name="order", type=str, description="Sort direction ('asc' or 'desc')", default="asc"),
        ],
        responses={
            200: [PlaceResponseSchema],
        },
    )
    def get(self, request):
        # Whitelist mapping string parameters strictly to SQLAlchemy columns
        ALLOWED_SORT_FIELDS = {
            'id': Place.id,
            'name': Place.name,
            'location': Place.location,
            'country': Place.country,
            'created_at': Place.created_at
        }

        with get_db() as db:
            db_places = db.query(Place)
            
            return self.paginate_and_sort(
                    request=request,
                    query=db_places,
                    model_class=Place,
                    allowed_sort_fields=ALLOWED_SORT_FIELDS,
                    response_schema=PlaceResponseSchema,
                    default_sort_field="id"
                )

    @extend_schema(
        request=PlaceCreateSchema,
        responses={
            201: PlaceResponseSchema,
        },
    )
    def post(self, request):
        authenticated_user_id = request.user.id
        try:
            # 1. Validate incoming JSON payload against Pydantic schema
            valid_data = PlaceCreateSchema.model_validate(request.data)
        except ValidationError as e:
            # Return validation errors if fields are missing or wrong types
            return Response(e.errors(), status=HTTP_400_BAD_REQUEST)

        # 2. Save valid data into the SQLAlchemy Database
        with get_db() as db:
            new_place = Place(
                name=valid_data.name,
                location=valid_data.location,
                country=valid_data.country,
                description=valid_data.description,
                image_paths=valid_data.image_paths,
                created_by_id=authenticated_user_id
            )
            db.add(new_place)
            db.commit()
            db.refresh(new_place)

            # 3. Format and return the newly created object
            response_data = PlaceResponseSchema.model_validate(new_place).model_dump()
        
        return Response(response_data, status=HTTP_201_CREATED)


class PlaceDetailAPIView(APIView):
    def get_permissions(self):
        """
        1. Assign permissions to methods individually.
        """
        if self.request.method == 'GET':
            return [AllowAny()]
            
        if self.request.method == 'PUT' or self.request.method == 'DELETE':
            # Put your creator permission here
            return [IsAuthenticated(), IsCreatorOrReadOnly()]
            
        return super().get_permissions()

    @extend_schema(
        summary="Get a single place details",
        responses={
            200: PlaceResponseSchema,
            404: OpenApiResponse(description="Place not found")
        }
    )
    def get(self, request, place_id):
        with get_db() as db:
            db_place = db.query(Place).filter(Place.id == place_id).first()
            if not db_place:
                return Response({"detail": "Place not found"}, status=HTTP_404_NOT_FOUND)
            
            response_data = PlaceResponseSchema.model_validate(db_place).model_dump()
            return Response(response_data, status=HTTP_200_OK)

    @extend_schema(
        summary="Update a place",
        request=PlaceUpdateSchema,
        responses={
            200: PlaceResponseSchema,
            404: OpenApiResponse(description="Place not found"),
            400: OpenApiResponse(description="Validation Error")
        }
    )
    def put(self, request, place_id):
        try:
            valid_data = PlaceUpdateSchema.model_validate(request.data)
        except ValidationError as e:
            return Response(e.errors(), status=HTTP_400_BAD_REQUEST)

        with get_db() as db:
            db_place = db.query(Place).filter(Place.id == place_id).first()
            if not db_place:
                return Response({"detail": "Place not found"}, status=HTTP_404_NOT_FOUND)
            
            self.check_object_permissions(request, db_place)
            
            # Extract only the fields explicitly sent in the JSON request
            update_dict = valid_data.model_dump(exclude_unset=True)
            
            # Dynamically update text fields or overwrite the image_paths list
            for key, value in update_dict.items():
                setattr(db_place, key, value)
            
            db.commit()
            db.refresh(db_place)
            response_data = PlaceResponseSchema.model_validate(db_place).model_dump()
            
        return Response(response_data, status=HTTP_200_OK)

    @extend_schema(
        summary="Delete a place",
        responses={
            204: OpenApiResponse(description="Deleted successfully"),
            404: OpenApiResponse(description="Place not found")
        }
    )
    def delete(self, request, place_id):
        with get_db() as db:
            db_place = db.query(Place).filter(Place.id == place_id).first()
            if not db_place:
                return Response({"detail": "Place not found"}, status=HTTP_404_NOT_FOUND)
            
            self.check_object_permissions(request, db_place)
            
            db.delete(db_place)
            db.commit()
            
        return Response(status=HTTP_204_NO_CONTENT)


