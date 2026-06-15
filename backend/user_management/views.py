
from drf_spectacular.utils import extend_schema
from rest_framework.views import APIView
from rest_framework.response import Response

from core.database import get_db
from user_management.models.user import User, UserRole
from user_management.schemas import UserLoginSchema, UserRegisterSchema, UserResponseSchema, LoginResponseSchema
from user_management.services import hash_password, verify_password
from rest_framework.status import HTTP_200_OK, HTTP_401_UNAUTHORIZED, HTTP_500_INTERNAL_SERVER_ERROR

from user_management.utils.jwt import create_access_token


class LoginAPIView(APIView):
    permission_classes = []

    @extend_schema(
        request=UserLoginSchema,
        responses={
            200: LoginResponseSchema
        }
    )
    def post(self, request):
        try:
            credentials = UserLoginSchema.model_validate(request.data)

            with get_db() as db:
                print("CC", credentials)
                user = db.query(User).filter(User.email == credentials.email).first()
                print("UU", user)
                if not user or not verify_password(credentials.password, user.hashed_password):
                    return Response({"detail": "Invalid credentials"}, status=HTTP_401_UNAUTHORIZED)

                access_token = create_access_token(user_id=user.id, role=user.role.value)

                return Response({
                    "access_token": access_token,
                    "token_type": "Bearer",
                    "user": UserResponseSchema.model_validate(user).model_dump()
                }, status=200)
        
        except Exception as e:
            print("EEEE", e)
            return Response(
                {"error": "Error while login"}, status=HTTP_500_INTERNAL_SERVER_ERROR
            )

class SignupAPIView(APIView):
    permission_classes = []

    @extend_schema(
        request=UserRegisterSchema,
        responses={
            200: UserResponseSchema
        }
    )
    def post(self, request):
        try:
            valid_data = UserRegisterSchema.model_validate(request.data)

            with get_db() as db:
                new_user = User(
                    name=valid_data.name,
                    email=valid_data.email,
                    hashed_password=hash_password(valid_data.password),
                    role=UserRole(valid_data.role) 
                    
                )
                
                db.add(new_user)
                db.commit()
            
                return Response(UserResponseSchema.model_validate(new_user).model_dump())
        
        except Exception as e:
            return Response(
                {"error": str(e)}, status=HTTP_500_INTERNAL_SERVER_ERROR
            )
