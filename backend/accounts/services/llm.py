import os
from groq import Groq

# Use environment variable instead of settings
client = Groq(api_key=os.getenv("GROQ_API_KEY"))

def ask_llm(question):
    try:
        prompt = f"""
You are an AI assistant for the Nueve Solutions company website.

Answer the following question clearly and concisely:

{question}
"""

        response = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
            max_tokens=200
        )

        return response.choices[0].message.content

    except Exception as e:
        return f"LLM Error: {str(e)}"