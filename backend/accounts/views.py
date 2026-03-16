from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from groq import Groq
import os
import numpy as np
from sentence_transformers import SentenceTransformer
from .models import ChatMessage, WebsiteChunk, Question, Answer
from .permissions import IsEmployee
from .serializers import SignupSerializer
from .services.llm import ask_llm
from .utils import index_website_with_crawler
from django.shortcuts import get_object_or_404
from django.views.decorators.csrf import csrf_exempt

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# Embedding model

embedding_model = SentenceTransformer("all-MiniLM-L6-v2")


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

    # 🔹 Get last 6 chat messages (history)
    history_messages = ChatMessage.objects.filter(
        user=request.user
    ).order_by("-created_at")[:6]

    history_text = ""

    for msg in reversed(history_messages):
        history_text += f"{msg.role}: {msg.content}\n"

    # 🔹 Convert question to embedding
    question_vector = embedding_model.encode(question)

    # 🔹 Get all website chunks
    chunks = WebsiteChunk.objects.all()

    scores = []

    for chunk in chunks:

        chunk_vector = np.array(chunk.embedding)

        similarity = np.dot(question_vector, chunk_vector) / (
            np.linalg.norm(question_vector) * np.linalg.norm(chunk_vector)
        )

        scores.append((similarity, chunk.content))

    # 🔹 Sort by similarity
    scores.sort(reverse=True)

    # 🔹 Take top 5 chunks
    top_chunks = [content for _, content in scores[:5]]

    context = "\n".join(top_chunks)

    # 🔹 Combine history + website context
    full_context = f"""
Conversation History:
{history_text}

Website Content:
{context}
"""

    # 🔹 Ask LLM
    answer = ask_llm(question, full_context)

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

# -----------------------------
# Create Question
# -----------------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_question(request):

    title = request.data.get("title")
    description = request.data.get("description")

    if not title or not description:
        return Response(
            {"error": "Title and description required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    Question.objects.create(
        user=request.user,
        title=title,
        description=description
    )

    return Response(
        {"message": "Question posted successfully"},
        status=status.HTTP_201_CREATED
    )


# -----------------------------
# List Questions
# -----------------------------
@api_view(["GET"])
def list_questions(request):

    search = request.GET.get("search", "")

    questions = Question.objects.filter(
        title__icontains=search
    ).order_by("-created_at")

    data = []

    for q in questions:
        data.append({
            "id": q.id,
            "title": q.title,
            "description": q.description,
            "user": q.user.username,
        })

    return Response(data)


# -----------------------------
# Update Question
# -----------------------------
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_question(request, question_id):

    question = get_object_or_404(Question, id=question_id)

    if question.user != request.user:
        return Response(
            {"error": "You cannot edit this question"},
            status=status.HTTP_403_FORBIDDEN
        )

    title = request.data.get("title")
    description = request.data.get("description")

    if title:
        question.title = title

    if description:
        question.description = description

    question.save()

    return Response({
        "message": "Question updated successfully"
    })


# -----------------------------
# Delete Question
# -----------------------------
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_question(request, question_id):

    question = get_object_or_404(Question, id=question_id)

    if question.user != request.user:
        return Response(
            {"error": "You cannot delete this question"},
            status=status.HTTP_403_FORBIDDEN
        )

    question.delete()

    return Response({
        "message": "Question deleted successfully"
    })


# -----------------------------
# Post Answer
# -----------------------------
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def post_answer(request, question_id):

    content = request.data.get("content")

    if not content:
        return Response(
            {"error": "Answer content required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    question = get_object_or_404(Question, id=question_id)

    Answer.objects.create(
        user=request.user,
        question=question,
        content=content
    )

    return Response({
        "message": "Answer posted successfully"
    })


# -----------------------------
# Get Answers
# -----------------------------
@api_view(["GET"])
def get_answers(request, question_id):

    answers = Answer.objects.filter(question_id=question_id)

    data = []

    for a in answers:
        data.append({
            "id": a.id,
            "user": a.user.username,
            "content": a.content
        })

    return Response(data)


# -----------------------------
# Update Answer
# -----------------------------
@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_answer(request, answer_id):

    answer = get_object_or_404(Answer, id=answer_id)

    if answer.user != request.user:
        return Response(
            {"error": "You cannot edit this answer"},
            status=status.HTTP_403_FORBIDDEN
        )

    content = request.data.get("content")

    if not content:
        return Response(
            {"error": "Content required"},
            status=status.HTTP_400_BAD_REQUEST
        )

    answer.content = content
    answer.save()

    return Response({
        "message": "Answer updated successfully"
    })


# -----------------------------
# Delete Answer
# -----------------------------
@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_answer(request, answer_id):

    answer = get_object_or_404(Answer, id=answer_id)

    if answer.user != request.user:
        return Response(
            {"error": "You cannot delete this answer"},
            status=status.HTTP_403_FORBIDDEN
        )

    answer.delete()

    return Response({
        "message": "Answer deleted successfully"
    })
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_profile(request):

    user = request.user

    return Response({
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "is_staff": user.is_staff
    })
