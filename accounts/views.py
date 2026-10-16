from django.contrib.auth import authenticate
from rest_framework import generics, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from .serializers import RegisterSerializer
from .models import Profile


class RegisterView(generics.CreateAPIView):

    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class LoginView(generics.GenericAPIView):

    permission_classes = [AllowAny]

    def post(self, request):

        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response(
                {
                    'error': 'Username and password are required.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        user = authenticate(
            username=username,
            password=password
        )

        if user is None:
            return Response(
                {
                    'error': 'Invalid username or password.'
                },
                status=status.HTTP_401_UNAUTHORIZED
            )

        try:
            profile = Profile.objects.get(user=user)
        except Profile.DoesNotExist:
            return Response(
                {
                    'error': 'Profile not found.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        if not profile.is_approved:
            return Response(
                {
                    'error': 'Your account is waiting for admin approval.'
                },
                status=status.HTTP_403_FORBIDDEN
            )

        refresh = RefreshToken.for_user(user)

        return Response(
            {
                'message': 'Login successful.',
                'username': user.username,
                'role': profile.role,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            },
            status=status.HTTP_200_OK
        )