import faiss
import numpy as np
from .models import WebsiteChunk

faiss_index = None
id_to_chunk = {}


def build_faiss_index():
    global faiss_index, id_to_chunk

    chunks = WebsiteChunk.objects.all()

    vectors = []
    id_to_chunk = {}

    idx = 0
    for chunk in chunks:
        if not chunk.embedding:
            continue

        vectors.append(chunk.embedding)
        id_to_chunk[idx] = (chunk.content, chunk.url)
        idx += 1

    if not vectors:
        faiss_index = None
        print("[FAISS] No vectors found")
        return

    vectors = np.array(vectors).astype("float32")
    dim = vectors.shape[1]

    faiss_index = faiss.IndexFlatIP(dim)
    faiss_index.add(vectors)

    print(f"[FAISS] Indexed {len(vectors)} chunks")


def search_faiss(query_vector, top_k=10):
    global faiss_index, id_to_chunk

    if faiss_index is None:
        return []

    query_vector = np.array([query_vector]).astype("float32")

    D, I = faiss_index.search(query_vector, top_k)

    results = []

    for idx, score in zip(I[0], D[0]):
        if idx == -1:
            continue

        content, url = id_to_chunk.get(idx, ("", ""))

        results.append((float(score), content, url))

    return results