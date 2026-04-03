from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from groq import Groq
import os
import numpy as np
from google import genai

from .models import ChatMessage, WebsiteChunk, Question, Answer, ChatSession
from .permissions import IsEmployee
from .serializers import SignupSerializer
from .services.llm import ask_llm
from .utils import index_website_with_crawler
from django.shortcuts import get_object_or_404
from django.core.cache import cache


# =============================
# ✅ Clients
# =============================
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
genai_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


# =============================
# ✅ Gemini Query Embedding
# =============================
def get_query_embedding(text):
    result = genai_client.models.embed_content(
        model="gemini-embedding-001",
        contents=text,
        config={"task_type": "RETRIEVAL_QUERY"}
    )
    return np.array(result.embeddings[0].values)


# =============================
# 🌐 Crawl Website
# =============================
@api_view(["POST"])
def crawl_website(request):
    url = request.data.get("url")

    if not url:
        return Response({"error": "URL is required"}, status=400)

    cached_data = cache.get(url)
    if cached_data:
        return Response({
            "message": "Loaded from cache",
            "data": cached_data
        })

    try:
        data = index_website_with_crawler(url)
        cache.set(url, data, timeout=3600)

        return Response({"message": "Website crawled successfully", "data": data})

    except Exception as e:
        return Response({"error": str(e)}, status=500)


# =============================
# 🤖 Copilot (MAIN CHAT)
# =============================
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def copilot(request):

    question = request.data.get("question", "").strip()
    session_id = request.data.get("session_id")
    url = request.data.get("url")

    if not question:
        return Response({"error": "Question is required"}, status=400)

    # Session
    session, _ = ChatSession.objects.get_or_create(
        session_id=session_id,
        defaults={
            "user": request.user,
            "url": url,
            "title": question[:40]
        }
    )

    # Save user message
    ChatMessage.objects.create(
        user=request.user,
        session=session,
        role="user",
        content=question
    )

    # History
    history_messages = ChatMessage.objects.filter(
        session=session
    ).order_by("-created_at")[:6]

    history_text = ""
    for msg in reversed(history_messages):
        history_text += f"{msg.role}: {msg.content}\n"

    # 🔥 Gemini embedding
    question_vector = get_query_embedding(question)

    # 🔥 Load chunks (LIMIT for speed)
    chunks = WebsiteChunk.objects.filter(url__icontains=url)[:200]

    chunk_vectors = []
    chunk_texts = []

    for chunk in chunks:
        chunk_vectors.append(chunk.embedding)
        chunk_texts.append(chunk.content)

    chunk_vectors = np.array(chunk_vectors)

    # Normalize
    question_vector = question_vector / np.linalg.norm(question_vector)
    chunk_vectors = chunk_vectors / np.linalg.norm(chunk_vectors, axis=1, keepdims=True)

    # Fast similarity
    similarities = np.dot(chunk_vectors, question_vector)

    # Top results
    top_k_idx = np.argsort(similarities)[-5:][::-1]
    top_chunks = [chunk_texts[i] for i in top_k_idx]

    # Better context
    context = "\n\n".join([
        f"Chunk {i+1}: {chunk}" for i, chunk in enumerate(top_chunks)
    ])

    full_context = f"""
You are an AI assistant.

Answer ONLY from the given context.
If not found, say "Not found in website".

Conversation History:
{history_text}

Website Content:
{context}
"""

    # 🔥 Groq LLM
    answer = ask_llm(question, full_context)

    # Save bot response
    ChatMessage.objects.create(
        user=request.user,
        session=session,
        role="bot",
        content=answer
    )

    return Response({"answer": answer})


# =============================
# ⚡ Extension API
# =============================
@api_view(["POST"])
def copilot_extension(request):

    question = request.data.get("question", "").strip()

    if not question:
        return Response({"error": "Question required"}, status=400)

    question_vector = get_query_embedding(question)

    chunks = WebsiteChunk.objects.all()[:200]

    chunk_vectors = []
    chunk_texts = []

    for chunk in chunks:
        chunk_vectors.append(chunk.embedding)
        chunk_texts.append(chunk.content)

    chunk_vectors = np.array(chunk_vectors)

    question_vector = question_vector / np.linalg.norm(question_vector)
    chunk_vectors = chunk_vectors / np.linalg.norm(chunk_vectors, axis=1, keepdims=True)

    similarities = np.dot(chunk_vectors, question_vector)

    top_k_idx = np.argsort(similarities)[-5:][::-1]
    top_chunks = [chunk_texts[i] for i in top_k_idx]

    context = "\n\n".join(top_chunks)

    answer = ask_llm(question, context)

    return Response({"answer": answer})
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_sessions(request):

    sessions = ChatSession.objects.filter(
        user=request.user
    ).order_by("-created_at")

    return Response([
        {
            "session_id": s.session_id,
            "title": s.title
        }
        for s in sessions
    ])


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def chat_history(request):

    session_id = request.GET.get("session_id")

    session = get_object_or_404(
        ChatSession,
        session_id=session_id,
        user=request.user
    )

    chats = ChatMessage.objects.filter(
        session=session
    ).order_by("created_at")

    return Response([
        {
            "role": c.role,
            "text": c.content,
            "created_at": c.created_at
        }
        for c in chats
    ])

@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_session(request, session_id):

    session = get_object_or_404(
        ChatSession,
        session_id=session_id,
        user=request.user
    )

    session.delete()

    return Response({"message": "Session deleted"})
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
def user_profile(request):
    user = request.user

    return Response({
        "id": user.id,
        "email": user.email,
        "username": user.username,
        "is_staff": user.is_staff
    })
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
