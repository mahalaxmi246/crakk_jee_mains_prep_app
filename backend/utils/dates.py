# utils/dates.py
from __future__ import annotations

from datetime import datetime, date, timezone, timedelta

# Robust ZoneInfo loader that works on Windows (without system tz DB)
def get_tz(tz_key: str):
    try:
        from zoneinfo import ZoneInfo, ZoneInfoNotFoundError
        try:
            # Try direct load (works on Linux/macOS or if tzdata already available)
            return ZoneInfo(tz_key)
        except ZoneInfoNotFoundError:
            # Ensure tzdata package is imported/installed, then retry
            import tzdata  # noqa: F401
            return ZoneInfo(tz_key)
    except Exception:
        # Last-resort fixed-offset fallback (no DST support)
        if tz_key == "Asia/Kolkata":
            return timezone(timedelta(hours=5, minutes=30))
        # Default to UTC fallback
        return timezone.utc

IST = get_tz("Asia/Kolkata")

def now_ist() -> datetime:
    return datetime.now(IST)

def today_ist_date() -> date:
    return now_ist().date()
