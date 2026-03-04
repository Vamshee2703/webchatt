# Web Copilot – Context-Aware Website Chatbot

A **Web Copilot system** that embeds a chatbot beside a website and answers user queries **contextually based on the website’s content**, using **Large Language Models (LLMs)** and a **secure backend crawling and indexing approach**.

---

# 🚀 Project Overview

Modern websites often require an intelligent assistant to help users understand information quickly.
This project builds a **website-aware AI copilot** that allows users to interact with website content through natural language.

The system works by:

* Embedding a website using **iframe**
* Crawling website content from the backend
* Processing the content using **LLM-based AI**
* Generating **context-aware responses**

The system also supports **secure user authentication and document-based chat (PDF chat).**

---

# 🎯 Problem Statement

Modern chatbots cannot directly read the content of websites embedded in an **iframe** because of browser security restrictions known as the **Same-Origin Policy**.

Therefore, the chatbot cannot access the website content directly from the frontend.

This project solves the problem by:

1. Crawling website content in the **backend**
2. Extracting useful text data
3. Injecting the extracted content into the **LLM prompt**
4. Generating **accurate context-aware responses**

---

# 🧠 Key Features

* Website embedded via **iframe**
* Chatbot panel beside the website
* **Dynamic website crawling**
* **Context-aware chatbot responses**
* **PDF document chat**
* Employee **Login & Signup authentication**
* Secure backend API architecture
* LLM-powered intelligent responses
* Modular full-stack system

---

# 🛠 Tech Stack

## Frontend

* Next.js
* React
* CSS
* iframe embedding

## Backend

* Python
* Django
* Django REST Framework
* JWT Authentication (SimpleJWT)

## AI / LLM

* Groq LLM API
* Hugging Face models
* Prompt Engineering
* Context Injection

## Data Processing

* Requests
* BeautifulSoup (Website Crawling)
* PDF parsing

## Tools

* Git & GitHub
* Postman (API testing)

---

# 🏗 Project Architecture

User interacts with chatbot beside the website.

System Flow:

User Question
↓
Frontend Chat Interface (Next.js)
↓
Django Backend API
↓
Website Content Crawling
↓
Content Extraction
↓
LLM Prompt Injection
↓
LLM Generates Answer
↓
Response Returned to User

---

# 📂 Project Structure

project-root/

frontend/
    pages/
        login.js
        signup.js
        index.js

    components/
        chatbot.js

    styles/
    public/

backend/
    webcopilot/
        views.py
        urls.py
        crawler.py

    users/
        models.py
        views.py
        serializers.py

    manage.py

README.md
.gitignore

---

# 🔐 Authentication System

The system supports **secure employee authentication**.

## Authentication Flow

1. User signs up using email, username, and password
2. Django creates a user account
3. User logs in using credentials
4. Backend returns:

* Access Token
* Refresh Token

5. Frontend stores tokens in **localStorage**
6. Protected APIs require the access token

---

## Backend Authentication (Django)

Uses:

djangorestframework-simplejwt

### API Endpoints

POST /api/signup/
POST /api/login/
POST /api/refresh/

CORS is enabled for frontend communication.

---

# 📄 Additional Feature – PDF Chat

Users can upload a **PDF document** and ask questions related to the document.

Workflow:

User uploads PDF
↓
PDF text extracted
↓
Text sent to LLM
↓
User asks question
↓
LLM answers using PDF context

---

# ⚙️ Installation & Setup

## 1️⃣ Clone the Repository

git clone https://github.com/yourusername/web-copilot.git

cd web-copilot

---

# 🖥 Running the Backend (Django)

Navigate to backend folder:

cd backend

Create virtual environment:

python -m venv venv

Activate virtual environment

Windows:

venv\Scripts\activate

Install dependencies:

pip install -r requirements.txt

Run migrations:

python manage.py migrate

Start Django server:

python manage.py runserver

Backend will run at:

http://127.0.0.1:8000/

---

# 🌐 Running the Frontend (Next.js)

Navigate to frontend folder:

cd frontend

Install dependencies:

npm install

Start development server:

npm run dev

Frontend will run at:

http://localhost:3000/

---

# 📄 Using PDF Chat Feature

1. Open the chatbot interface
2. Upload a PDF file
3. The system extracts the text content
4. Ask questions related to the uploaded document

Example API endpoint:

POST /api/pdf-chat/

Example request:

Upload PDF → Extract text → Send question → LLM generates answer

---

# 🟢 8-Week Development Plan

## Week 1 – Problem Understanding & Setup

* Finalize problem statement
* Study copilot architecture
* Install development tools
* Setup project repository

Deliverables

* Problem statement
* GitHub repository
* Development environment

---

## Week 2 – Frontend UI & Website Embedding

* Develop Next.js interface
* Build chatbot UI
* Embed website using iframe

Deliverables

* Copilot UI
* Embedded website

---

## Week 3 – Backend API & Authentication

* Django backend setup
* Implement authentication
* Create chatbot API

POST /api/ask/

Additional work completed:

* PDF chat feature
* Basic website crawler

Deliverables

* Backend APIs working
* Authentication implemented

---

## Week 4 – LLM Integration

* Integrate Groq / HuggingFace LLM
* Handle API errors
* Implement loading UI

Deliverables

* AI generated responses

---

## Week 5 – Dynamic Website Crawling

* Accept website URL
* Crawl website using requests & BeautifulSoup
* Extract website content
* Inject content into LLM prompt

System Flow

User enters website URL
↓
Backend crawls website
↓
Content extracted
↓
LLM generates answer

Deliverables

* Dynamic website chatbot

---

## Week 6 – UX Improvements

* Chat history
* Clear chat button
* Loading indicators
* Prompt improvements
* UI improvements

Deliverables

* Better chatbot UX

---

## Week 7 – Testing & Optimization

* Test with multiple websites
* Handle invalid URLs
* Optimize prompt size
* Improve performance

Deliverables

* Stable build

---

## Week 8 – Documentation & Final Demo

* Architecture diagram
* Sequence diagram
* System documentation
* Demo preparation

Deliverables

* Final project presentation

---

# 🔒 Security Considerations

## iframe Limitation

Browser **Same-Origin Policy** prevents accessing iframe content from another domain.

## Backend Crawling Solution

The backend safely retrieves website content and provides it to the chatbot.

---

# 🚧 Future Scope

* Vector database (FAISS / Pinecone)
* Retrieval Augmented Generation (RAG)
* Multi-website indexing
* Chat memory
* Admin dashboard
* Analytics

---

# 📌 Conclusion

This project demonstrates a **real-world AI Copilot system** integrating:

* Full-stack web development
* LLM-powered chat systems
* Backend crawling architecture
* Secure authentication
* Context-aware AI responses

---

👨‍💻 Author: **Vamshee**
📅 Project Duration: **8 Weeks**
