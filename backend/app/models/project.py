from dataclasses import dataclass


@dataclass
class Project:
    id: str
    user_id: str
    name: str
    created_at: str

