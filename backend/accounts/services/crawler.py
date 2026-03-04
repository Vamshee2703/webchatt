import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin, urlparse


BASE_URL = "https://nuevesolutions.com/"


def get_internal_links(url):
    response = requests.get(url, timeout=10)
    soup = BeautifulSoup(response.text, "html.parser")

    links = set()

    for tag in soup.find_all("a", href=True):
        href = tag["href"]
        full_url = urljoin(BASE_URL, href)

        # keep only same domain
        if urlparse(full_url).netloc == urlparse(BASE_URL).netloc:
            links.add(full_url.split("#")[0])

    return list(links)


def extract_text(url):
    try:
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.text, "html.parser")

        for tag in soup(["script", "style", "noscript"]):
            tag.decompose()

        text = soup.get_text(separator=" ")
        return " ".join(text.split())

    except:
        return ""


def crawl_full_website():
    print("🔎 Crawling website...")

    visited = set()
    to_visit = [BASE_URL]
    full_content = ""

    while to_visit and len(visited) < 15:  # limit to 15 pages
        url = to_visit.pop(0)

        if url in visited:
            continue

        visited.add(url)

        print(f"✔ Crawled: {url}")

        page_text = extract_text(url)
        full_content += "\n\n" + page_text

        links = get_internal_links(url)

        for link in links:
            if link not in visited:
                to_visit.append(link)

    print("✅ Crawling complete")
    return full_content