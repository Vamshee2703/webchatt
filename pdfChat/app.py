import streamlit as st
from dotenv import load_dotenv
import pickle
from PyPDF2 import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from groq import Groq
import os
import base64
import time

load_dotenv()

# ---------------- PAGE CONFIG ----------------
st.set_page_config(
    page_title="PDF Chatbot",
    page_icon="📄",
    layout="wide"
)

# ---------------- CUSTOM STYLING ----------------
st.markdown("""
<style>

body {
    background: linear-gradient(-45deg,#020617,#1e3a8a,#6d28d9,#0ea5e9);
    background-size: 400% 400%;
    animation: gradientMove 14s ease infinite;
}

@keyframes gradientMove {
  0% { background-position:0% 50% }
  50% { background-position:100% 50% }
  100% { background-position:0% 50% }
}

.block-container {
    max-width: 900px;
    margin: auto;
}

/* USER MESSAGE */
.user-msg {
    background: linear-gradient(135deg,#22c55e,#4ade80);
    color:#052e16;
    padding:12px;
    border-radius:14px;
    max-width:70%;
    margin-left:auto;
    margin-top:10px;
    font-weight:500;
}
.bot-msg {
    background: rgba(255,255,255,0.9);
    color:#020617;
    padding:12px;
    border-radius:14px;
    max-width:70%;
    margin-right:auto;
    margin-top:10px;
}
section[data-testid="stSidebar"] {
    background: rgba(0,0,0,0.6);
    backdrop-filter: blur(10px);
}

</style>
""", unsafe_allow_html=True)

# ---------------- SIDEBAR ----------------
with st.sidebar:
    st.title("🤗💬 PDF Chatbot")

    st.markdown("""
    ### About
    Chat with your PDF using AI.

    **Tech Stack**
    - Streamlit
    - LangChain (RAG)
    - HuggingFace Embeddings
    - FAISS Vector Search
    - Groq LLaMA-3
    """)

    st.write("Made with ❤️ by Vamshee")

# ---------------- GROQ CLIENT ----------------
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def query_llm(prompt):

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "Answer ONLY using the provided context."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.1,
        max_tokens=400
    )

    return response.choices[0].message.content


# ---------------- PDF PROCESSING ----------------
def process_pdf(pdf):

    pdf_reader = PdfReader(pdf)

    text = ""

    for page in pdf_reader.pages:
        extracted = page.extract_text()
        if extracted:
            text += extracted

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200
    )

    chunks = text_splitter.split_text(text)

    store_name = pdf.name.replace(".pdf","")

    if os.path.exists(f"{store_name}.pkl"):
        with open(f"{store_name}.pkl","rb") as f:
            vectorstore = pickle.load(f)

    else:

        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )

        vectorstore = FAISS.from_texts(chunks, embeddings)

        with open(f"{store_name}.pkl","wb") as f:
            pickle.dump(vectorstore,f)

    return vectorstore


# ---------------- MAIN APP ----------------
def main():

    st.title("📄 Chat With Your PDF")
    st.caption("Ask questions and get answers directly from your document.")

    if "messages" not in st.session_state:
        st.session_state.messages = []

    pdf = st.file_uploader("Upload your PDF", type="pdf")

    if pdf is not None:

        # PDF Preview
        st.sidebar.subheader("📄 PDF Preview")

        base64_pdf = base64.b64encode(pdf.read()).decode('utf-8')

        pdf_display = f'''
        <iframe src="data:application/pdf;base64,{base64_pdf}"
        width="100%" height="500"></iframe>
        '''

        st.sidebar.markdown(pdf_display, unsafe_allow_html=True)

        vectorstore = process_pdf(pdf)

        # Render chat history
        for message in st.session_state.messages:

            if message["role"] == "user":
                st.markdown(
                    f"<div class='user-msg'>{message['content']}</div>",
                    unsafe_allow_html=True
                )

            else:
                st.markdown(
                    f"<div class='bot-msg'>{message['content']}</div>",
                    unsafe_allow_html=True
                )

        query = st.chat_input("Ask a question about your PDF")

        if query:

            st.session_state.messages.append(
                {"role":"user","content":query}
            )

            st.markdown(
                f"<div class='user-msg'>{query}</div>",
                unsafe_allow_html=True
            )

            docs = vectorstore.similarity_search(query,k=8)

            context = "\n\n".join(doc.page_content for doc in docs)

            prompt = f"""
You are an AI assistant answering questions about a PDF.

Use ONLY the context below.

If the answer is not in the document say:
"The answer is not available in the document."

Context:
{context}

Question:
{query}
"""

            with st.spinner("Thinking... ⚡"):

                answer = query_llm(prompt)

            # typing animation
            placeholder = st.empty()

            typed = ""

            for char in answer:
                typed += char
                placeholder.markdown(
                    f"<div class='bot-msg'>{typed}</div>",
                    unsafe_allow_html=True
                )
                time.sleep(0.01)

            st.session_state.messages.append(
                {"role":"assistant","content":answer}
            )


# ---------------- RUN ----------------
if __name__ == "__main__":
    main()