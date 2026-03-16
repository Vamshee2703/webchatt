import streamlit as st
from dotenv import load_dotenv
from PyPDF2 import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from groq import Groq
import psycopg2
import os
import base64
import time

load_dotenv()

# ---------------- GROQ CLIENT ----------------
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# ---------------- POSTGRES CONNECTION ----------------
conn = psycopg2.connect(
    host="localhost",
    database="chatai_db",
    user="postgres",
    password="admin",
    port="5432"
)

cursor = conn.cursor()

# ---------------- STREAMLIT PAGE ----------------
st.set_page_config(
    page_title="PDF Chatbot",
    page_icon="📄",
    layout="wide"
)

st.title("📄 Chat With Your PDF")
st.caption("Upload a PDF and ask questions.")

# ---------------- SESSION STATE ----------------
if "messages" not in st.session_state:
    st.session_state.messages = []

if "pdf_id" not in st.session_state:
    st.session_state.pdf_id = None

# ---------------- LLM FUNCTION ----------------
def query_llm(prompt):

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "Answer only using the context."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.1,
        max_tokens=400
    )

    return response.choices[0].message.content

# ---------------- PDF PROCESSING ----------------
def process_pdfs(pdfs):

    text = ""

    for pdf in pdfs:
        pdf.seek(0)
        reader = PdfReader(pdf)

        for page in reader.pages:
            extracted = page.extract_text()

            if extracted:
                text += extracted

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )

    chunks = splitter.split_text(text)

    embeddings = HuggingFaceEmbeddings(
        model_name="sentence-transformers/all-MiniLM-L6-v2"
    )

    vectorstore = FAISS.from_texts(chunks, embeddings)

    return vectorstore

# ---------------- FILE UPLOAD ----------------
pdfs = st.file_uploader(
    "Upload PDF",
    type="pdf",
    accept_multiple_files=True
)

if pdfs:

    # Save PDF metadata to PostgreSQL
    if st.session_state.pdf_id is None:

        filename = pdfs[0].name

        cursor.execute(
            "INSERT INTO pdf_documents (filename) VALUES (%s) RETURNING id",
            (filename,)
        )

        pdf_id = cursor.fetchone()[0]
        conn.commit()

        st.session_state.pdf_id = pdf_id

        st.success(f"PDF stored with ID: {pdf_id}")

    # Sidebar preview
    st.sidebar.subheader("📄 PDF Preview")

    for pdf in pdfs:

        pdf.seek(0)
        base64_pdf = base64.b64encode(pdf.read()).decode("utf-8")

        pdf_display = f"""
        <iframe src="data:application/pdf;base64,{base64_pdf}"
        width="100%" height="400"></iframe>
        """

        st.sidebar.markdown(f"### {pdf.name}", unsafe_allow_html=True)
        st.sidebar.markdown(pdf_display, unsafe_allow_html=True)

    # Build vector store
    if "vectorstore" not in st.session_state:
        st.session_state.vectorstore = process_pdfs(pdfs)

    vectorstore = st.session_state.vectorstore

    # ---------------- CHAT HISTORY ----------------
    for message in st.session_state.messages:

        if message["role"] == "user":
            st.markdown(f"**You:** {message['content']}")

        else:
            st.markdown(f"**Bot:** {message['content']}")

    # ---------------- CHAT INPUT ----------------
    query = st.chat_input("Ask something about the PDF")

    if query:

        st.session_state.messages.append({
            "role": "user",
            "content": query
        })

        # Save user message to DB
        cursor.execute(
            "INSERT INTO pdf_chat (pdf_id, role, message) VALUES (%s,%s,%s)",
            (st.session_state.pdf_id, "user", query)
        )

        conn.commit()

        docs = vectorstore.similarity_search(query, k=5)

        context = "\n\n".join(doc.page_content for doc in docs)

        prompt = f"""
Context:
{context}

Question:
{query}

Answer:
"""

        with st.spinner("Thinking..."):
            answer = query_llm(prompt)

        placeholder = st.empty()
        typed = ""

        for char in answer:
            typed += char
            placeholder.markdown(f"**Bot:** {typed}")
            time.sleep(0.01)

        st.session_state.messages.append({
            "role": "assistant",
            "content": answer
        })

        # Save bot message
        cursor.execute(
            "INSERT INTO pdf_chat (pdf_id, role, message) VALUES (%s,%s,%s)",
            (st.session_state.pdf_id, "bot", answer)
        )

        conn.commit()