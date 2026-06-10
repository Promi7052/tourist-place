from rest_framework.response import Response
from rest_framework.status import HTTP_200_OK, HTTP_400_BAD_REQUEST

class PaginationnSortingMixin:
    """
    A reusable mixin for Django REST Framework APIViews to paginate 
    and sort SQLAlchemy query models seamlessly.
    """
    def paginate_and_sort(
        self, 
        request, 
        query, 
        model_class, 
        allowed_sort_fields, 
        response_schema,
        default_sort_field="id"
    ) -> Response:
        # 1. Parse and validate pagination indices
        try:
            page = max(1, int(request.query_params.get('page', 1)))
            page_size = max(1, min(100, int(request.query_params.get('page_size', 10))))
        except ValueError:
            return Response(
                {"detail": "Page and page_size parameters must be valid integers."}, 
                status=HTTP_400_BAD_REQUEST
            )

        # 2. Resolve sorting rules safely
        sort_by = request.query_params.get('sort_by', default_sort_field).lower()
        order = request.query_params.get('order', 'asc').lower()

        # Fallback to the specified default column if lookup field isn't explicitly whitelisted
        default_column = getattr(model_class, default_sort_field)
        sort_column = allowed_sort_fields.get(sort_by, default_column)
        
        if order == 'desc':
            sort_column = sort_column.desc()
        else:
            sort_column = sort_column.asc()

        # 3. Calculate windows and execute query extensions
        total_count = query.count()
        offset_value = (page - 1) * page_size

        db_items = (
            query.order_by(sort_column)
            .limit(page_size)
            .offset(offset_value)
            .all()
        )

        # 4. Serialize objects natively via Pydantic V2 schemas
        serialized_results = [
            response_schema.model_validate(item).model_dump() 
            for item in db_items
        ]

        # 5. Emit unified envelope payload back to client
        return Response({
            "total_count": total_count,
            "page": page,
            "page_size": page_size,
            "results": serialized_results
        }, status=HTTP_200_OK)