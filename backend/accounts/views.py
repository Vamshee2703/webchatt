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
from .utils import index_website_with_crawler


client = Groq(api_key=os.getenv("GROQ_API_KEY"))


# -----------------------------
# Crawl Website API
# -----------------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def crawl_website(request):

    url = request.data.get("url")

    if not url:
        return Response({"error": "URL is required"}, status=400)

    try:
        index_website_with_crawler(url)

        return Response({
            "message": "Website crawled and indexed successfully"
        })

    except Exception as e:
        return Response({
            "error": str(e)
        }, status=500)


# -----------------------------
# Copilot Chat API
# -----------------------------
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

    # Ask LLM
    answer = ask_llm(question)

    # Save bot response
    ChatMessage.objects.create(
        user=request.user,
        role="bot",
        content=answer,
    )

    return Response({"answer": answer})


# -----------------------------
# Signup API
# -----------------------------
@api_view(["POST"])
def signup(request):

    serializer = SignupSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save()
        return Response(
            {"message": "User created successfully"},
            status=201
        )

    return Response(serializer.errors, status=400)


# -----------------------------
# Employee Profile API
# -----------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated, IsEmployee])
def employee_me(request):

    return Response({
        "id": request.user.id,
        "email": request.user.email,
        "username": request.user.username,
        "is_staff": request.user.is_staff,
    })


# -----------------------------
# Chat History API
# -----------------------------
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def chat_history(request):

    chats = ChatMessage.objects.filter(
        user=request.user
    ).order_by("created_at")

    return Response([
        {
            "role": c.role,
            "text": c.content,
            "created_at": c.created_at
        }
        for c in chats
    ])