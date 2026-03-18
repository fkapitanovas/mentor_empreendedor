from typing import Optional
from pydantic import BaseModel


class UserProfile(BaseModel):
    name: Optional[str] = None
    setor: Optional[str] = None
    estagio: Optional[str] = None
    tempo_negocio: Optional[str] = None
    faturamento: Optional[str] = None
    desafio_principal: Optional[str] = None


class MessageRecord(BaseModel):
    role: str
    content: str
