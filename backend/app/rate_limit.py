from collections import defaultdict, deque
from time import monotonic

from fastapi import HTTPException

_BUCKETS: dict[str, deque[float]] = defaultdict(deque)


def enforce_rate_limit(key: str, limit: int, window_seconds: int) -> None:
    now = monotonic()
    bucket = _BUCKETS[key]
    cutoff = now - window_seconds
    while bucket and bucket[0] < cutoff:
        bucket.popleft()
    if len(bucket) >= limit:
        raise HTTPException(429, "محاولات كثيرة. حاول مرة أخرى بعد قليل")
    bucket.append(now)

    if len(_BUCKETS) > 5000:
        stale = [name for name, values in _BUCKETS.items() if not values or values[-1] < cutoff]
        for name in stale[:1000]:
            _BUCKETS.pop(name, None)
