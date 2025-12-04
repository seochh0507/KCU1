from pathlib import Path

from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException
from webdriver_manager.chrome import ChromeDriverManager


from bs4 import BeautifulSoup
from datetime import datetime, timedelta, timezone
from dateutil import parser as dtparser
import re
import json
import os


BASE = "https://www.cityofmadison.com"
LIST_URL = f"{BASE}/police/incident-reports"
HEADLESS = False # 창 일단 띄움 
WAIT_SEC = 12 


# Chrome 드라이버 초기화
def make_driver():
    try:
        options = webdriver.ChromeOptions()
        if HEADLESS:
            options.add_argument("--headless=new")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-gpu")
        options.add_argument("--window-size=1280,1200")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument(
            "user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
            "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36"
        )
        driver = webdriver.Chrome(
            service=Service(ChromeDriverManager().install()),
            options=options
        )
        driver.set_page_load_timeout(60)
        return driver
    except Exception as e:
        print(f"[ERROR] Failed to initialize driver: {e}")
        raise


# 문자열을 datetime으로 안전하게 파싱
def parse_date_maybe(s: str):
    s = (s or "").strip()
    if not s:
        return None
    # 특수 대시 대비
    s = s.replace("–", "-").replace("—", "-")
    try:
        dt = dtparser.parse(s, fuzzy=True)
        # 타임존 없으면 UTC로 설정
        if dt.tzinfo is None:
            dt = dt.replace(tzinfo=timezone.utc)
        return dt
    except Exception as e:
        print(f"[WARN] Date parse failed for '{s}': {e}")
        return None
    

# HTML tag (el)에서 텍스트 추출
def bs_get_text(el, default=""):
    if not el:
        return default
    try:
        return el.get_text(" ", strip=True)
    except Exception:
        return default


# 텍스트 정리 (연속 공백 제거, 줄바꿈 정리)
def clean_text(text: str) -> str:
    if not text:
        return ""
    # 연속 공백을 하나로
    text = re.sub(r"\s+", " ", text)
    return text.strip()


# Detail Page Parser (h2 기반)
def extract_detail_fields(soup: BeautifulSoup):
    
    # --- NEW: 최신 구조의 incident_date 추출 ---
    time_tag = soup.select_one("div.field--name-field-incident-date time")
    if time_tag:
        dt_raw = time_tag.get("datetime") or time_tag.get_text(strip=True)
        parsed = parse_date_maybe(dt_raw)
        fields = {
            "location": "",
            "incident_date": dt_raw,
            "incident_date_parsed": parsed,
            "incident_type": "",
            "case_id": "",
            "arrested": "Unknown"
        }
    else:
        fields = {
            "location": "",
            "incident_date": "",
            "incident_date_parsed": None,
            "incident_type": "",
            "case_id": "",
            "arrested": "Unknown"
        }
    
    try:
        # 모든 h2 헤더 찾기
        headers = soup.find_all("h2")
        
        for h2 in headers:
            label = bs_get_text(h2).strip()
            if not label:
                continue
            
            # h2 다음에 나오는 텍스트 수집 (다음 h2 전까지)
            content_parts = []
            current = h2.find_next_sibling()
            
            while current and current.name != "h2":
                text = bs_get_text(current)
                if text:
                    content_parts.append(text)
                current = current.find_next_sibling()
            
            value = clean_text(" ".join(content_parts))
            
            # 매핑 (대소문자 무시)
            label_lower = label.lower()
            
            if "location" in label_lower or "address" in label_lower:
                fields["location"] = value
                
            elif "incident date" in label_lower or "date" in label_lower:
                fields["incident_date"] = value
                
            elif "incident type" in label_lower or "type" in label_lower:
                fields["incident_type"] = value
                
            elif "case id" in label_lower or "case number" in label_lower:
                fields["case_id"] = value
                
            elif "arrested" in label_lower or "arrestee" in label_lower:
                fields["arrested"] = value if value else "Unknown"
        
        # Incident Date를 datetime으로 파싱 (시간 정보 포함)
        if fields["incident_date"]:
            dt = parse_date_maybe(fields["incident_date"])
            fields["incident_date_parsed"] = dt
        else:
            fields["incident_date_parsed"] = None
            
    except Exception as e:
        print(f"[WARN] extract_detail_fields error: {e}")
    
    return fields


# Wait & Soup Helper
def wait_and_get_soup(driver, wait, css="article"):
    """페이지 로딩 대기 후 BeautifulSoup 반환"""
    try:
        wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, css)))
        return BeautifulSoup(driver.page_source, "html.parser")
    except TimeoutException:
        print(f"[WARN] Timeout waiting for selector: {css}")
        # 타임아웃이어도 현재 페이지 소스 반환
        return BeautifulSoup(driver.page_source, "html.parser")
    except Exception as e:
        print(f"[ERROR] wait_and_get_soup failed: {e}")
        raise



# List Page Crawler
# 목록 페이지에서 최근 7일 이내 사건 URL 수집
def fetch_list_items(driver, wait):
    cutoff = datetime.now(timezone.utc) - timedelta(days=7)
    results = []
    page = 0
    max_pages = 20  # 무한 루프 방지
    
    while page < max_pages:
        try:
            url = LIST_URL if page == 0 else f"{LIST_URL}?page={page}"
            print(f"[INFO] Fetching list page {page}: {url}")
            
            driver.get(url)
            soup = wait_and_get_soup(driver, wait, "article, .views-row")
            
            # 사건 링크 찾기 (여러 셀렉터 시도)
            cards = soup.select(".views-row a[href*='incident-reports']")
            if not cards:
                cards = soup.select("article a[href*='incident-reports']")
            if not cards:
                print(f"[INFO] No more cards on page {page}, stopping.")
                break
            
            page_has_recent = False
            
            for a in cards:
                try:
                    href = a.get("href", "").strip()
                    if not href:
                        continue
                    
                    detail_url = href if href.startswith("http") else BASE + href
                    title = bs_get_text(a)
                    
                    # 목록에서 날짜 정보 (선택적)
                    date_text = ""
                    parent = a.find_parent("div", class_="views-row") or a.find_parent("article")
                    if parent:
                        date_el = parent.find("time")
                        if date_el:
                            date_text = bs_get_text(date_el)
                    
                    # 날짜 체크 (7일 이내인지)
                    dt = parse_date_maybe(date_text) if date_text else None
                    if not dt:
                        page_has_recent = True  # 날짜 불명은 일단 수집
                    else:
                        if dt >= cutoff:
                            page_has_recent = True
                    
                    results.append({
                        "title": title,
                        "list_raw_date": date_text,
                        "detail_url": detail_url
                    })
                    
                except Exception as e:
                    print(f"[WARN] Failed to parse card: {e}")
                    continue
            
            if not page_has_recent:
                print(f"[INFO] No recent items on page {page}, stopping.")
                break
            
            page += 1
            
        except Exception as e:
            print(f"[ERROR] Failed to fetch page {page}: {e}")
            break
    
    print(f"[INFO] Found {len(results)} total list items")
    return results



# Detail Page Crawler
# 상세 페이지에서 모든 필드 추출 (시간 정보 포함)
def fetch_detail(driver, wait, detail_url: str):
    try:
        driver.get(detail_url)
        soup = wait_and_get_soup(driver, wait, "article, .layout__region--content")
        
        fields = extract_detail_fields(soup)
        
        return {
            "location": fields.get("location", ""),
            "incident_date_text": fields.get("incident_date", ""),
            "incident_date": fields.get("incident_date_parsed"),
            "incident_type": fields.get("incident_type", ""),
            "case_id": fields.get("case_id", ""),
            "arrested": fields.get("arrested", "Unknown")
        }
        
    except TimeoutException:
        print(f"[WARN] Timeout on detail page: {detail_url}")
        raise
    except Exception as e:
        print(f"[ERROR] fetch_detail failed for {detail_url}: {e}")
        raise



# Main Execution
def main():
    cutoff = datetime.now(timezone.utc) - timedelta(days=7)
    driver = None

    try:
        print("=" * 60)
        print("Madison Police Incident Reports Scraper")
        print("=" * 60)

        driver = make_driver()
        wait = WebDriverWait(driver, WAIT_SEC)
        results = []

        # 1. 목록 페이지 크롤링
        print("\n[STEP 1] Fetching list pages...")
        list_items = fetch_list_items(driver, wait)
        print(f"[INFO] Processing {len(list_items)} items...")

        # 2. 각 상세 페이지 크롤링
        print("\n[STEP 2] Fetching detail pages...")
        for idx, item in enumerate(list_items, 1):
            detail_url = item["detail_url"]
            print(f"\n[INFO] ({idx}/{len(list_items)}) Processing:")
            print(f"       {detail_url}")

            try:
                detail = fetch_detail(driver, wait, detail_url)

                # 날짜 우선순위: 상세 페이지 → 목록 페이지
                incident_dt = detail.get("incident_date")
                if not incident_dt and item.get("list_raw_date"):
                    incident_dt = parse_date_maybe(item["list_raw_date"])

                # 7일 이내만 포함
                if not incident_dt:
                    print(f"       [SKIP] No date found")
                    continue
                elif incident_dt < cutoff:
                    print(f"       [SKIP] Outside date range ({incident_dt.date()})")
                    continue

                # 제목 생성: "Case ID + Incident Type"
                case_id = detail.get("case_id", "").strip()
                incident_type = detail.get("incident_type", "").strip()

                if case_id and incident_type:
                    title = f"{case_id} + {incident_type}"
                elif case_id:
                    title = case_id
                elif incident_type:
                    title = incident_type
                else:
                    title = item.get("title", "Untitled").strip()

                # 결과 저장
                results.append({
                    "title": title,
                    "case_id": case_id,
                    "incident_type": incident_type,
                    "location": detail.get("location", "").strip(),
                    "incident_date": incident_dt.isoformat(),
                    "incident_date_text": detail.get("incident_date_text", ""),
                    "arrested": detail.get("arrested", "Unknown").strip(),
                    "url": detail_url
                })

                print(f"       [SUCCESS] {title}")
                print(f"       Date: {detail.get('incident_date_text', 'N/A')}")

            except TimeoutException:
                print(f"       [WARN] Timeout, skipping")
            except Exception as e:
                print(f"       [ERROR] {type(e).__name__}: {e}")
                continue

        # 3. JSON 파일 저장
        print("\n" + "=" * 60)
        print("[STEP 3] Saving results...")

        payload = {
            "source": "City of Madison Police Incident Reports",
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "days_lookback": 7,
            "count": len(results),
            "items": results
        }

        out_path = Path(__file__).resolve().parent / "incidents.json"
        try:
            out_path.parent.mkdir(parents=True, exist_ok=True)
            with out_path.open("w", encoding="utf-8") as f:
                json.dump(payload, f, ensure_ascii=False, indent=2)
            print(f"[SUCCESS] Saved {len(results)} items to: {out_path}")
        except Exception as e:
            print(f"[ERROR] Failed to save JSON: {e}")
            print("[INFO] Printing results to console instead:")
            print(json.dumps(payload, ensure_ascii=False, indent=2))

        print("=" * 60)
        print(f"Scraping completed! Total items: {len(results)}")
        print("=" * 60)

    except KeyboardInterrupt:
        print("\n[INFO] Interrupted by user (Ctrl+C)")
    except Exception as e:
        print(f"\n[FATAL ERROR] {type(e).__name__}: {e}")
    finally:
        if driver:
            try:
                driver.quit()
                print("\n[INFO] Browser closed")
            except:
                pass


if __name__ == "__main__":
    main()