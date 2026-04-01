import os
from groq import Groq

client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def ask_llm(question, context):

    prompt = f"""
You are a website AI assistant.

You will receive:
- Website content
- A user question

Your job is to answer the question ONLY using the website content.

---------------------------
CONTEXT
---------------------------
{context}

---------------------------
QUESTION
---------------------------
{question}

---------------------------
INSTRUCTIONS
---------------------------

1. Answer ONLY if the information exists in the context.
2. Do NOT add greetings like "Hello" or "Hi".
3. Do NOT repeat the question.
4. Give clear, direct answers.
5. If the answer is not found in the context, respond EXACTLY:
   "This information is not available on the website."

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