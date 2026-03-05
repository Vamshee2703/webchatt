import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from sentence_transformers import SentenceTransformer
from .models import WebsiteChunk

embedding_model = SentenceTransformer("all-MiniLM-L6-v2")


# ----------------------------
# Extract Website Text
# ----------------------------
def extract_website_text(url):

    response = requests.get(
        url,
        timeout=10,
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"},
    )

    soup = BeautifulSoup(response.text, "html.parser")

    for tag in soup(["script", "style", "noscript", "nav", "footer", "header"]):
        tag.decompose()

    text = soup.get_text(separator=" ")

    return " ".join(text.split())


# ----------------------------
# Chunk Text
# ----------------------------
def chunk_text(text, chunk_size=200):

    words = text.split()

    return [
        " ".join(words[i:i + chunk_size])
        for i in range(0, len(words), chunk_size)
    ]


# ----------------------------
# Crawl Website
# ----------------------------
def crawl_website(start_url, max_pages=50):

    visited = set()
    to_visit = [start_url]

    base_domain = urlparse(start_url).netloc

    while to_visit and len(visited) < max_pages:

        url = to_visit.pop(0)

        if url in visited:
            continue

        try:

            response = requests.get(
                    url,
                    timeout=10,
                    headers={
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                    }
                )
            soup = BeautifulSoup(response.text, "html.parser")

            visited.add(url)

            for link in soup.find_all("a", href=True):

                full_url = urljoin(url, link["href"])
                parsed = urlparse(full_url)

                if (
                    parsed.netloc == base_domain
                    and full_url not in visited
                    and "#" not in full_url
                ):
                    to_visit.append(full_url)

        except Exception:
            continue

    return visited


# ----------------------------
# Index Website
# ----------------------------
def index_website_with_crawler(start_url):

    WebsiteChunk.objects.all().delete()

    urls = crawl_website(start_url, max_pages=20)

    for url in urls:

        try:

            text = extract_website_text(url)

            if not text or len(text) < 200:
                continue

            chunks = chunk_text(text)

            for chunk in chunks:

                vector = embedding_model.encode(chunk).tolist()

                WebsiteChunk.objects.create(
                    url=url,
                    content=chunk,
                    embedding=vector,
                )

        except Exception:
            continue