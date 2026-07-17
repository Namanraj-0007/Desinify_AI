import base64
import hashlib
import hmac
import os

# Stable password hashing (no bcrypt/passlib dependency)
# Format: base64(salt) + '$' + base64(derived_key)
_SALT_BYTES = 16
_DERIVED_BYTES = 32
_ITERATIONS = 200_000


def hash_password(password: str) -> str:
    salt = os.urandom(_SALT_BYTES)
    dk = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        _ITERATIONS,
        dklen=_DERIVED_BYTES,
    )
    return f"{base64.b64encode(salt).decode('ascii')}$" f"{base64.b64encode(dk).decode('ascii')}"


def verify_password(password: str, hashed_password: str) -> bool:
    try:
        salt_b64, dk_b64 = hashed_password.split("$", 1)
        salt = base64.b64decode(salt_b64)
        expected = base64.b64decode(dk_b64)
    except Exception:
        return False

    dk = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        _ITERATIONS,
        dklen=_DERIVED_BYTES,
    )
    return hmac.compare_digest(dk, expected)











