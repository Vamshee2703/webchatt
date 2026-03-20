import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse
from sentence_transformers import SentenceTransformer
from .models import WebsiteChunk


embedding_model = SentenceTransformer("all-MiniLM-L6-v2")


# -----------------------------
# Extract clean text
# -----------------------------
def extract_text(url):

    try:
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")

        # remove unwanted tags
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

            vector = embedding_model.encode(chunk).tolist()

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