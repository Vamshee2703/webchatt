import streamlit as st
from dotenv import load_dotenv
import pickle
from PyPDF2 import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from groq import Groq
import os

load_dotenv()

# ---------------- PAGE CONFIG ----------------
st.set_page_config(
    page_title="PDF Chatbot",
    page_icon="📄",
    layout="wide"
)

# ---------------- SIDEBAR ----------------
with st.sidebar:
    st.title("🤗💬 LLM Chat App")
    st.markdown("""
    ## About
    Chat with your PDF using AI.

    **Tech Stack**
    - Streamlit
    - LangChain (RAG)
    - HuggingFace Embeddings
    - Groq LLaMA-3
    """)
    st.write("Made with ❤️ by Vamshee")

# ---------------- GROQ CLIENT ----------------
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def query_llm(prompt: str) -> str:
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": "Answer ONLY using the provided context."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.1,
        max_tokens=400,
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

    store_name = pdf.name.replace(".pdf", "")

    if os.path.exists(f"{store_name}.pkl"):
        with open(f"{store_name}.pkl", "rb") as f:
            vectorstore = pickle.load(f)
    else:
        embeddings = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2"
        )

        vectorstore = FAISS.from_texts(chunks, embeddings)

        with open(f"{store_name}.pkl", "wb") as f:
            pickle.dump(vectorstore, f)

    return vectorstore


# ---------------- MAIN APP ----------------
def main():

    st.title("📄 Chat with Your PDF")

    if "messages" not in st.session_state:
        st.session_state.messages = []

    pdf = st.file_uploader("Upload your PDF", type="pdf")

    if pdf is not None:

        vectorstore = process_pdf(pdf)

        # display previous messages
        for message in st.session_state.messages:
            with st.chat_message(message["role"]):
                st.write(message["content"])

        query = st.chat_input("Ask a question about your PDF")

        if query:

            # show user message
            st.session_state.messages.append(
                {"role": "user", "content": query}
            )

            with st.chat_message("user"):
                st.write(query)

            docs = vectorstore.max_marginal_relevance_search(query, k=5)

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

Answer:
"""

            with st.spinner("Thinking... ⚡"):
                answer = query_llm(prompt)

            # show AI response
            with st.chat_message("assistant"):
                st.write(answer)

            st.session_state.messages.append(
                {"role": "assistant", "content": answer}
            )


# ---------------- RUN ----------------
if __name__ == "__main__":
    main()