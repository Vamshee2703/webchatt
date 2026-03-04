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

# -------------------- SIDEBAR --------------------
with st.sidebar:
    st.title("🤗💬 LLM Chat App")
    st.markdown("""
    ## About
    This app is a PDF-based AI chatbot built using:
    - Streamlit
    - LangChain (RAG)
    - HuggingFace Embeddings
    - Groq LLM (LLaMA-3)
    """)
    st.write("Made with ❤️ by Vamshee")

# -------------------- GROQ CLIENT --------------------
load_dotenv()

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def query_llm(prompt: str) -> str:
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {
                "role": "system",
                "content": "Answer strictly using the given context."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0.1,
        max_tokens=300,
    )
    return response.choices[0].message.content

# -------------------- MAIN APP --------------------
def main():
    st.header("📄 Chat with PDF")

    pdf = st.file_uploader("Upload your PDF", type="pdf")

    if pdf is not None:
        pdf_reader = PdfReader(pdf)
        text = ""

        for page in pdf_reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50
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

        query = st.text_input("Ask a question about your PDF")

        if query:
            docs = vectorstore.similarity_search(query, k=2)
            context = "\n\n".join(doc.page_content for doc in docs)

            prompt = f"""
Answer the question using ONLY the context below.

Context:
{context}

Question:
{query}
"""

            with st.spinner("Thinking... ⚡"):
                answer = query_llm(prompt)

            st.subheader("Answer")
            st.write(answer)

# -------------------- RUN --------------------
if __name__ == "__main__":
    main()

