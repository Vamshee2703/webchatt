from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from groq import Groq
import os

from .models import ChatMessage
from .permissions import IsEmployee
from .serializers import SignupSerializer
from .services.llm import ask_llm


client = Groq(api_key=os.getenv("GROQ_API_KEY"))


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def copilot(request):
    question = request.data.get("question", "").strip()

    if not question:
        return Response({"error": "Question is required"}, status=400)

    # Save user message
    ChatMessage.objects.create(
        user=request.user,
        role="user",
        content=question,
    )

    # 🔹 Ask LLM (crawler-based)
    answer = ask_llm(question)

    # Save bot message
    ChatMessage.objects.create(
        user=request.user,
        role="bot",
        content=answer,
    )

    return Response({"answer": answer})


@api_view(["POST"])
def signup(request):
    serializer = SignupSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message": "User created successfully"}, status=201)
    return Response(serializer.errors, status=400)


@api_view(["GET"])
@permission_classes([IsAuthenticated, IsEmployee])
def employee_me(request):
    return Response({
        "id": request.user.id,
        "email": request.user.email,
        "username": request.user.username,
        "is_staff": request.user.is_staff,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def chat_history(request):
    chats = ChatMessage.objects.filter(user=request.user).order_by("created_at")
    return Response([
        {"role": c.role, "text": c.content, "created_at": c.created_at}
        for c in chats
    ])