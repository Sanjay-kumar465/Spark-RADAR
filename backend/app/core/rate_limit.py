import time
from typing import Dict, List
from fastapi import Request, HTTPException, status

class InMemoryRateLimiter:
    def __init__(self, requests_limit: int = 30, window_seconds: int = 60):
        self.requests_limit = requests_limit
        self.window_seconds = window_seconds
        self.history: Dict[str, List[float]] = {}

    def check(self, request: Request, identifier: str = None):
        client_ip = identifier or (request.client.host if request.client else "127.0.0.1")
        now = time.time()
        
        # Clean expired timestamps
        timestamps = self.history.get(client_ip, [])
        cutoff = now - self.window_seconds
        valid_timestamps = [t for t in timestamps if t > cutoff]

        if len(valid_timestamps) >= self.requests_limit:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many authentication attempts. Please wait before retrying."
            )

        valid_timestamps.append(now)
        self.history[client_ip] = valid_timestamps

auth_rate_limiter = InMemoryRateLimiter(requests_limit=60, window_seconds=60)

