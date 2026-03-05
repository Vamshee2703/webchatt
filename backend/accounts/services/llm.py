import os
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def ask_llm(question, context):

    prompt = f"""
You are an intelligent AI assistant designed to answer questions about a specific website.

You are given:
1. Conversation history between the user and the assistant
2. Relevant website content retrieved from the crawled website

Your task is to answer the user's question using ONLY the provided information.

---------------------------
CONTEXT
---------------------------
{context}

---------------------------
USER QUESTION
---------------------------
{question}

---------------------------
INSTRUCTIONS
---------------------------

1. Carefully read the website content and conversation history.
2. Answer the user's question based strictly on the information available.
3. If the user refers to something mentioned earlier, use the conversation history.
4. Do NOT invent facts or add external knowledge.
5. If the answer cannot be found in the website content or history, respond exactly with:

"This information is not available on the website."

6. Provide clear and concise answers.
7. If possible, explain the answer in 2–4 sentences.

---------------------------
ANSWER
---------------------------
"""

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "system", "content": "You are a helpful website assistant."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.1,
        max_tokens=400
    )

    return response.choices[0].message.content