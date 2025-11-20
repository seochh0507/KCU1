# MadCrime 프로젝트 구조 & 연동 가이드 (초안)

> 작성자: 백엔드 파트 (incident linker)
> 목적: 팀 미팅에서 **전체 구조 공유** + **파트별 역할 정리** + **앞으로 진행 가이드**

---

## 1. 전체 디렉터리 구조 (현재/목표)

루트 기준 디렉터리 구조(논리적 구조):

```text
프로젝트 루트/
├─ data/                     # 데이터 팀: 원본 크롤링 결과 + 백엔드 가공 결과
│   ├─ incidents.json        # [입력] 데이터 팀 크롤러 결과 (원본)
│   └─ incidents_front.json  # [출력] 백엔드가 생성하는 프론트용 JSON
├─ backend/                  # 백엔드(연동/가공) 파트
│   ├─ __init__.py
│   └─ incidents_backend.py  # incidents.json → incidents_front.json 변환 로직
├─ front/                    # 프론트(React) 파트
│   ├─ public/
│   │   ├─ index.html
│   │   └─ incidents_front.json  # (배포 시 data/에서 복사해서 사용, 방식 A)
│   └─ src/
│       ├─ components/       # Dashboard / Map / MenuBar 등
│       └─ pages/            # Main / About / Contact 등
└─ main/                     # 나중에 브랜치/코드 병합용 (현재는 개념적 폴더)
```

- **data/**: 크롤링 결과와, 프론트에서 쓸 수 있도록 가공된 JSON이 모두 모이는 “데이터 허브”
- **backend/**: data/incidents.json 을 읽어 통계 & 테이블 형식으로 가공하는 **링크/로직 파트**
- **front/**: 준비된 JSON을 `fetch()` 해서 화면에 보여주는 **UI 파트**
- **main/**: 팀별 작업을 모아서 병합하는 용도 (브랜치/폴더 이름만 공유된 상태)

---

## 2. JSON 스펙 (팀 간 약속)

### 2-1. 데이터 팀 → 백엔드: `data/incidents.json` (입력)

데이터 팀이 크롤링 후 생성해주는 JSON 구조 (예시):

```json5
{
  "source": "City of Madison Police Incident Reports",
  "generated_at": "2025-11-20T22:12:34.123456+00:00",
  "days_lookback": 7,
  "count": 42,
  "items": [
    {
      "title": "2025-123456 + Burglary",
      "case_id": "2025-123456",
      "incident_type": "Burglary",
      "location": "6800 block Cross Country Rd, Madison, WI 53719",
      "incident_date": "2025-11-19T11:31:00+00:00",
      "incident_date_text": "November 19, 2025 – 5:31am",
      "arrested": "No",
      "url": "https://www.cityofmadison.com/..."
    }
  ]
}
```

- `items` 배열의 각 원소는 **하나의 사건(incident)** 를 의미
- `incident_date` 는 **ISO8601 문자열**로 저장 (Python `datetime.isoformat()` 수준)

### 2-2. 백엔드 → 프론트: `data/incidents_front.json` (출력)

`backend/incidents_backend.py` 가 생성하는, 프론트 친화적인 JSON 구조:

```json5
{
  "totalIncidents": 42,           // 지난 7일간 incidents 총 개수
  "stats": {
    "incidentsToday": 3,          // "오늘 날짜" 사건 수
    "mostCommonType": "THEFT",    // 가장 빈도가 높은 incident_type
    "peakTime": "EVENING"         // NIGHT/MORNING/AFTERNOON/EVENING 중 최다
  },
  "table": [
    {
      "id": 1,                    // 프론트 테이블용 row id (1부터 시작)
      "date": "2025-11-19",       // YYYY-MM-DD
      "type": "Burglary",         // incident_type
      "time": "18:30",            // HH:MM (24시간제)
      "location": "6800 block Cross Country Rd, Madison, WI 53719"
    }
  ],
  "rawItems": [
    /* data/incidents.json 의 items 를 그대로 복사 */
  ]
}
```

- 프론트에서는 **`stats` + `table`** 만 사용해도 Dashboard 구현 가능
- `rawItems` 는 필요 시 Map / 추가 통계 등에 활용 가능

---

## 3. 백엔드 파트 구현 (이미 세팅된 내용)

### 3-1. 파일: `backend/incidents_backend.py`

역할 요약:

1. `data/incidents.json` 읽기
2. incidents 리스트에서 통계 계산
   - 오늘 날짜 사건 수 (`incidentsToday`)
   - 최빈 incident_type (`mostCommonType`)
   - 시간대별(NIGHT/MORNING/AFTERNOON/EVENING)로 나눴을 때 최다 시간대 (`peakTime`)
3. Dashboard 테이블용 row 생성
   - `{id, date, type, time, location}` 형태
4. 결과를 하나의 dict로 묶어 `data/incidents_front.json` 에 저장

핵심 함수들(요약):

- `load_raw_incidents()`  
  → `data/incidents.json` 로딩 + 최소 유효성 검사
- `compute_stats(incidents)`  
  → `stats` 딕셔너리 생성
- `build_table_rows(incidents)`  
  → `table` 배열 생성
- `build_front_payload(raw_payload)`  
  → `totalIncidents`, `stats`, `table`, `rawItems` 를 포함한 최종 payload 생성
- `generate_front_json()`  
  → 위 함수들을 조합해 `data/incidents_front.json` 파일 생성

실행 방법(루트에서):

```bash
python backend/incidents_backend.py
```

성공 시:

- `data/incidents_front.json` 이 새로 생성/갱신됨
- 터미널에 `[SUCCESS] Front JSON generated at: ...` 메시지 출력

---

## 4. 프론트 파트에서의 사용 방식 (방식 A 기준)

### 4-1. 수동/반자동 연결 (방식 A – 현재 가정)

병합/배포 시에만 다음 작업을 해도 충분함:

1. 백엔드 스크립트 실행  
   → `python backend/incidents_backend.py`  
   → `data/incidents_front.json` 생성
2. 이 파일을 프론트 public 폴더로 복사  
   → `data/incidents_front.json` → `front/public/incidents_front.json`
3. 프론트 React 코드에서:

```js
// 예시: 메인 페이지에서 전체 개수 + 대시보드 데이터 로딩
useEffect(() => {
  async function loadData() {
    try {
      const res = await fetch('/incidents_front.json');
      const data = await res.json();

      setTotalNumber(data.totalIncidents);   // 상단 큰 숫자
      setStatsData(data.stats);              // Dashboard 상단 3개 카드
      setTableData(data.table);              // Full Dataset 테이블
    } catch (err) {
      console.error('Failed to load incidents_front.json', err);
    }
  }

  loadData();
}, []);
```

이렇게 하면 프론트는 **API 서버 없이도** 항상 최신 incidents_front.json 을 읽어와서 화면에 반영 가능.

### 4-2. (선택) 나중에 자동화하고 싶을 때

- 루트에 `copy_incidents.js` 같은 Node 스크립트를 두고  
  `data/incidents_front.json → front/public/incidents_front.json` 자동 복사
- `front/package.json` 의 `start` / `build` 스크립트에  
  `npm run copy-data && react-scripts start` 형태로 연동

이건 팀에서 빌드/배포 자동화를 하기로 결정했을 때 추가 논의하면 됨.

---

## 5. 파트별 역할 정리

### 5-1. 데이터 팀

- City of Madison Incident Reports 크롤러 구현
- 결과를 **`data/incidents.json`** 포맷으로 저장
- 위 JSON 스키마만 지켜주면, 백엔드/프론트는 수정 없이 그대로 동작

### 5-2. 백엔드(링크/가공) 파트

- 이미 구현된 `backend/incidents_backend.py` 유지/보완
- 필요 시:
  - 통계 항목 추가 (예: incident_type 별 카운트, arrested 비율 등)
  - `table` 컬럼 확장 (예: case_id 추가 등)
- 데이터 팀과 협의하여 JSON 스펙 변경 시 대응

### 5-3. 프론트(UI) 파트

- `incidents_front.json` 을 `/incidents_front.json` 경로에서 `fetch()` 하여 사용
- 주요 사용 예:
  - `totalIncidents` → 메인 상단 숫자 애니메이션
  - `stats` → Dashboard 상단 카드 3개
  - `table` → Full Dataset 테이블
  - `rawItems` → 지도(Map), 상세 카드, 필터링 등에 활용

---

## 6. 앞으로 진행 가이드 (Phase별)

### Phase 1 – 백엔드 & 데이터 팀 연동 테스트

1. 데이터 팀
   - `data/incidents.json` 샘플 1~2개 제공
2. 백엔드
   - `python backend/incidents_backend.py` 실행
   - `data/incidents_front.json` 잘 생성되는지 확인
   - 값이 예상대로 나오는지 (total, stats, table) 샘플 체크
3. 문제 있으면 JSON 필드명/타입 조정 후, 스펙 확정

### Phase 2 – 프론트와의 통합

1. `data/incidents_front.json` 을 `front/public/` 로 복사
2. 프론트 코드에서:
   - `/incidents_front.json` 을 `fetch()` 하는 로직 추가
   - Main / Dashboard 컴포넌트에 `totalIncidents`, `stats`, `table` 연결
3. UI/UX 부분(애니메이션, 스타일 등)은 프론트에서 자유롭게 보완

### Phase 3 – 고도화 & 자동화 (선택)

- Node 스크립트로 `data → front/public` 자동 복사
- CI/CD 파이프라인에서
  - 데이터 크롤링 → incidents.json 생성
  - 백엔드 스크립트 실행 → incidents_front.json 생성
  - 프론트 빌드 시 incidents_front.json 자동 포함
- Map 기능 강화
  - `rawItems` 기반으로 주소 → 위도/경도 변환(geocoding)
  - Google Maps / Leaflet 등과 연동

---

## 7. 미팅에서 논의하면 좋은 포인트

1. **JSON 스펙 확정**  
   - `incident_type` 값 범위, `arrested` 표현 방식(Yes/No/Unknown 등)
   - 추가로 필요한 필드 (예: 경찰서 구역, severity 등)
2. **데이터 업데이트 주기**  
   - 크롤링/가공을 어느 주기로 돌릴지 (매일 1번, 수동 실행 등)
3. **자동화 수준**  
   - 지금은 방식 A(수동 복사)로 시작 → 필요 시 빌드 스크립트로 자동화
4. **프론트 요구사항**  
   - Dashboard에 어떤 추가 그래프/필터가 필요한지
   - Map에서 어떤 정보까지 보여줄지

---

(이 문서는 초안이므로, 팀 논의 후 JSON 필드나 흐름이 바뀌면 버전업해서 같이 관리하면 좋습니다.)
