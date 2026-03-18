"""Testes unitarios para split de mensagens no twilio_service."""
import pytest
from app.services.twilio_service import _split_message


class TestSplitMessage:
    def test_mensagem_curta(self):
        parts = _split_message("Ola, tudo bem?")
        assert len(parts) == 1
        assert parts[0] == "Ola, tudo bem?"

    def test_mensagem_exata_no_limite(self):
        msg = "a" * 1500
        parts = _split_message(msg)
        assert len(parts) == 1

    def test_split_respeita_espaco(self):
        # 1498 chars de "a " + "fim" = 1501 chars — deve cortar no espaco
        msg = "a " * 749 + "fim"
        parts = _split_message(msg, max_len=1500)
        assert len(parts) >= 1
        for part in parts:
            assert len(part) <= 1500
        # Nenhuma parte deve comecar/terminar com espaco
        for part in parts:
            assert part == part.strip()

    def test_split_respeita_newline(self):
        lines = ["Linha " + str(i) for i in range(200)]
        msg = "\n".join(lines)
        parts = _split_message(msg, max_len=100)
        assert len(parts) > 1
        for part in parts:
            assert len(part) <= 100

    def test_fallback_sem_espaco(self):
        # String sem espacos maior que max_len — deve cortar no limite
        msg = "a" * 3000
        parts = _split_message(msg, max_len=1500)
        assert len(parts) == 2
        assert len(parts[0]) == 1500
        assert len(parts[1]) == 1500

    def test_mensagem_vazia(self):
        parts = _split_message("")
        assert len(parts) == 1
        assert parts[0] == ""

    def test_reconstrucao(self):
        msg = "Palavra " * 300  # ~2400 chars
        parts = _split_message(msg.strip(), max_len=1500)
        # Todas as palavras devem estar presentes na reconstrucao
        reconstructed = " ".join(parts)
        assert reconstructed.count("Palavra") == 300
