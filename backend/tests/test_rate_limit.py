import pytest
from fastapi import HTTPException

from app.rate_limit import _BUCKETS, enforce_rate_limit


def test_rate_limit_blocks_after_limit():
    _BUCKETS.clear()
    enforce_rate_limit("test:key", limit=2, window_seconds=60)
    enforce_rate_limit("test:key", limit=2, window_seconds=60)
    with pytest.raises(HTTPException) as exc:
        enforce_rate_limit("test:key", limit=2, window_seconds=60)
    assert exc.value.status_code == 429
