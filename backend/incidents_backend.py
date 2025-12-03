# backend/incidents_backend.py

from __future__ import annotations

from pathlib import Path
from datetime import datetime
from typing import List, Dict, Any
import json


# === 1. 경로 설정 ===

# 이 파일 기준: ../data/incidents.json 읽어서,
#             ../data/incidents_front.json 로 쓰는 구조
BASE_DIR = Path(__file__).resolve().parent         # .../backend
DATA_DIR = BASE_DIR.parent / "data"                # .../data

RAW_INCIDENTS_PATH = DATA_DIR / "incidents.json"        # 데이터 팀 결과
FRONT_INCIDENTS_PATH = DATA_DIR / "incidents_front.json"  # 프론트용 결과


# === 2. 유틸 함수들 ===

def load_raw_incidents(path: Path = RAW_INCIDENTS_PATH) -> Dict[str, Any]:
    """
    data/incidents.json 을 읽어서 전체 payload(dict)를 반환.
    - 파일이 없거나 형식이 이상하면 예외를 던진다.
    기대 포맷:
    {
      "source": "...",
      "generated_at": "...",
      "days_lookback": 7,
      "count": 42,
      "items": [ {...}, {...}, ... ]
    }
    """
    if not path.exists():
        raise FileNotFoundError(f"Incidents JSON not found at: {path}")

    with path.open("r", encoding="utf-8") as f:
        data = json.load(f)

    items = data.get("items")
    if not isinstance(items, list):
        raise ValueError("Invalid incidents.json: 'items' must be a list")

    return data


def parse_iso_datetime(value: str | None) -> datetime | None:
    """
    incident_date (ISO8601 문자열)를 datetime으로 파싱.
    value가 None이거나 잘못된 포맷이면 None 반환.
    """
    if not value:
        return None
    try:
        return datetime.fromisoformat(value)
    except Exception:
        return None


# === 3. 통계 계산 로직 ===

TIME_BUCKET_LABELS = {
    "night": "NIGHT",        # 0 ~ 5
    "morning": "MORNING",    # 6 ~ 11
    "afternoon": "AFTERNOON",# 12 ~ 17
    "evening": "EVENING",    # 18 ~ 23
}


def compute_stats(incidents: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    incidents 리스트에서 Dashboard용 통계 3개를 계산한다.
    - incidentsToday: 오늘 날짜에 해당하는 사건 수
    - mostCommonType: 가장 자주 등장한 incident_type
    - peakTime: NIGHT/MORNING/AFTERNOON/EVENING 중 가장 많은 시간대
    """

    if not incidents:
        return {
            "incidentsToday": 0,
            "mostCommonType": "-",
            "peakTime": "-",
        }

    now = datetime.now()
    today_y, today_m, today_d = now.year, now.month, now.day

    incidents_today = 0
    type_counts: Dict[str, int] = {}
    time_buckets = {
        "night": 0,
        "morning": 0,
        "afternoon": 0,
        "evening": 0,
    }

    for inc in incidents:
        iso_str = inc.get("incident_date")
        dt = parse_iso_datetime(iso_str)
        if dt is None:
            continue

        # 오늘 사건인지 확인
        if dt.year == today_y and dt.month == today_m and dt.day == today_d:
            incidents_today += 1

        # 타입 카운트
        t = (inc.get("incident_type") or "UNKNOWN").strip() or "UNKNOWN"
        type_counts[t] = type_counts.get(t, 0) + 1

        # 시간대 카운트
        hour = dt.hour  # 0~23
        if hour < 6:
            time_buckets["night"] += 1
        elif hour < 12:
            time_buckets["morning"] += 1
        elif hour < 18:
            time_buckets["afternoon"] += 1
        else:
            time_buckets["evening"] += 1

    # 가장 흔한 타입
    most_common_type = "-"
    max_type_count = -1
    for t, cnt in type_counts.items():
        if cnt > max_type_count:
            max_type_count = cnt
            most_common_type = t

    # 피크 시간대
    peak_bucket_key = "-"
    max_bucket_count = -1
    for bucket_key, cnt in time_buckets.items():
        if cnt > max_bucket_count:
            max_bucket_count = cnt
            peak_bucket_key = bucket_key

    peak_time_label = (
        "-" if peak_bucket_key == "-" else TIME_BUCKET_LABELS.get(peak_bucket_key, "-")
    )

    return {
        "incidentsToday": incidents_today,
        "mostCommonType": most_common_type,
        "peakTime": peak_time_label,
    }


def build_table_rows(incidents: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Dashboard의 Full Dataset 테이블에 들어갈 형식으로 incidents 를 변환한다.
    각 row 형식:
    {
        "id": 1,
        "date": "2025-11-19",
        "type": "Burglary",
        "time": "13:45",
        "location": "somewhere"
    }
    """

    rows: List[Dict[str, Any]] = []

    for idx, inc in enumerate(incidents, start=1):
        iso_str = inc.get("incident_date")
        dt = parse_iso_datetime(iso_str)

        if dt is not None:
            date_str = dt.date().isoformat()   # 2025-11-19
            time_str = dt.strftime("%H:%M")    # 13:45
        else:
            date_str = inc.get("incident_date_text") or ""
            time_str = ""

        row = {
            "id": idx,
            "date": date_str,
            "type": inc.get("incident_type") or "N/A",
            "time": time_str,
            "location": inc.get("location") or "",
        }
        rows.append(row)

    return rows


# === 4. 프론트용 payload 만들기 ===

def build_front_payload(raw_payload: Dict[str, Any]) -> Dict[str, Any]:
    """
    data/incidents.json 전체 payload를 받아,
    프론트가 쓰기 좋은 구조로 가공한 dict를 반환.

    반환 구조:
    {
        "totalIncidents": number,
        "stats": {...},
        "table": [...],
        "rawItems": [...]
    }
    """

    items: List[Dict[str, Any]] = raw_payload.get("items", [])
    total_incidents = raw_payload.get("count", len(items))

    stats = compute_stats(items)
    table = build_table_rows(items)

    return {
        "totalIncidents": total_incidents,
        "stats": stats,
        "table": table,
        "rawItems": items,
    }


def generate_front_json(
    raw_path: Path = RAW_INCIDENTS_PATH,
    out_path: Path = FRONT_INCIDENTS_PATH,
) -> Path:
    """
    data/incidents.json 을 읽어서
    data/incidents_front.json 을 생성한다.
    (경로는 파라미터로 바꿀 수도 있음)
    """
    raw_payload = load_raw_incidents(raw_path)
    front_payload = build_front_payload(raw_payload)

    out_path.parent.mkdir(parents=True, exist_ok=True)
    with out_path.open("w", encoding="utf-8") as f:
        json.dump(front_payload, f, ensure_ascii=False, indent=2)

    return out_path


# === 5. 디버깅/테스트용 main ===

def main() -> None:
    """
    python backend/incidents_backend.py
    로 실행했을 때:
    - data/incidents.json 을 읽어서
    - data/incidents_front.json 을 생성
    """

    print("=" * 60)
    print("Backend: Madison Incident Reports Linker")
    print("=" * 60)

    try:
        out_path = generate_front_json()
    except Exception as e:
        print(f"[ERROR] Failed to generate front json: {e}")
        return

    print(f"[SUCCESS] Front JSON generated at: {out_path}")


if __name__ == "__main__":
    main()
