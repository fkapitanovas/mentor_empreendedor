"""Testes unitarios para helpers do webhook (idempotencia e rate limiting)."""
import pytest
import time
from app.routers.webhook import _is_duplicate, _is_rate_limited, _seen_sids, _seen_sids_lock, _rate_tracker, _rate_lock


class TestIdempotency:
    def setup_method(self):
        with _seen_sids_lock:
            _seen_sids.clear()

    def test_first_message_not_duplicate(self):
        assert _is_duplicate("SM001") is False

    def test_same_sid_is_duplicate(self):
        _is_duplicate("SM002")
        assert _is_duplicate("SM002") is True

    def test_different_sids(self):
        _is_duplicate("SM003")
        assert _is_duplicate("SM004") is False


class TestRateLimiting:
    def setup_method(self):
        with _rate_lock:
            _rate_tracker.clear()

    def test_under_limit(self):
        for i in range(9):
            assert _is_rate_limited("phone1") is False

    def test_at_limit(self):
        for i in range(10):
            _is_rate_limited("phone2")
        assert _is_rate_limited("phone2") is True

    def test_different_phones_independent(self):
        for i in range(10):
            _is_rate_limited("phone3")
        # phone4 should not be affected
        assert _is_rate_limited("phone4") is False
