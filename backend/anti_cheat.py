from PIL import Image
import imagehash
import io

HAMMING_THRESHOLD = 10  # Images with Hamming distance ≤ 10 are considered duplicates


def compute_phash(image_bytes: bytes) -> str:
    """Compute perceptual hash of image."""
    img = Image.open(io.BytesIO(image_bytes))
    return str(imagehash.phash(img))


def is_duplicate(new_hash: str, existing_hashes: list) -> bool:
    """Check if new_hash is too similar to any existing hash."""
    new = imagehash.hex_to_hash(new_hash)
    for h in existing_hashes:
        try:
            existing = imagehash.hex_to_hash(h)
            if abs(new - existing) <= HAMMING_THRESHOLD:
                return True
        except Exception:
            continue
    return False
