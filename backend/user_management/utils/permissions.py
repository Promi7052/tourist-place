from rest_framework import permissions



class IsCreatorOrReadOnly(permissions.BasePermission):
    """
    Custom permission to only allow creators of a place to edit or delete it.
    """
    def has_object_permission(self, request, view, obj):
        # 1. Allow read-only operations (GET, HEAD, OPTIONS) for anyone
        if request.method in permissions.SAFE_METHODS:
            return True

        # 2. Check if the logged-in user is authenticated
        if not request.user or not request.user.is_authenticated:
            return False

        # 3. Deny write permissions unless the user matches the creator id
        # obj is your SQLAlchemy 'Place' instance
        user_id = getattr(request.user, "id", None)
        return obj.created_by_id == user_id