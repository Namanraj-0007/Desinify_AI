from dataclasses import dataclass


@dataclass
class User:
    id: str
    name: str
    email: str
    password_hash: str

