import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from google import genai
import os
from .models import WebsiteChunk


# ✅ Gemini client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


# -----------------------------
# Gemini Document Embedding
# -----------------------------
def get_embedding(text):
    try:
        result = client.models.embed_content(
            model="gemini-embedding-001",
            contents=text,
            config={
                "task_type": "RETRIEVAL_DOCUMENT"
            }
        )
        return result.embeddings[0].values

    except Exception as e:
        print("Embedding error:", e)
        return None


# -----------------------------
# Extract clean text
# -----------------------------
def extract_text(url):
    try:
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")

        for tag in soup(["script", "style", "noscript", "nav", "footer", "header"]):
            tag.decompose()

        text = soup.get_text(separator=" ")
        return " ".join(text.split())

    except Exception:
        return ""


# -----------------------------
# Get internal links
# -----------------------------
def get_internal_links(url, base_domain):
    try:
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")

        links = set()

        for tag in soup.find_all("a", href=True):
            href = tag["href"]
            full_url = urljoin(url, href)

            parsed = urlparse(full_url)

            if parsed.netloc == base_domain:
                links.add(full_url.split("#")[0])

        return list(links)

    except Exception:
        return []


# -----------------------------
# Chunk text
# -----------------------------
def chunk_text(text, chunk_size=200):
    words = text.split()

    return [
        " ".join(words[i:i + chunk_size])
        for i in range(0, len(words), chunk_size)
    ]


# -----------------------------
# Crawl and index website
# -----------------------------
def index_website_with_crawler(start_url):

    WebsiteChunk.objects.all().delete()

    base_domain = urlparse(start_url).netloc

    visited = set()
    to_visit = [start_url]

    while to_visit and len(visited) < 20:

        url = to_visit.pop(0)

        if url in visited:
            continue

        visited.add(url)

        print(f"✔ Crawled: {url}")

        text = extract_text(url)

        if not text or len(text) < 200:
            continue

        chunks = chunk_text(text)

        for chunk in chunks:

            vector = get_embedding(chunk)

            if vector is None:
                continue

            WebsiteChunk.objects.create(
                url=url,
                content=chunk,
                embedding=vector,
            )

        links = get_internal_links(url, base_domain)

        for link in links:
            if link not in visited:
                to_visit.append(link)

    print("✅ Crawling and indexing completed")