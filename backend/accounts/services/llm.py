import os
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def ask_llm(question, context):

    prompt = f"""
You are a friendly AI assistant for a website chatbot.

You will receive:
1. Conversation history
2. Website content

Your task is to answer the user's question.

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

1. If the user greets you (hi, hello, hey, good morning, etc), respond with a friendly greeting.
   Example:
   "Hello! How can I help you with this website?"

2. If the user asks general conversation questions (like "who are you"),
   respond politely as a website assistant.

3. If the question is about the website, answer using ONLY the provided website content.

4. Do NOT invent information that is not present in the website content.

5. If the answer is not available in the website content, respond exactly with:
"This information is not available on the website."

6. Do NOT say things like:
   - "Based on the context"
   - "Based on website content"

7. Give clear and concise answers.

---------------------------
FINAL ANSWER
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