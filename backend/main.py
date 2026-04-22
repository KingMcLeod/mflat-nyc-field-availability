from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import httpx
from datetime import date, timedelta

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Headers that make our requests look like they come from a real browser.
# NYC Parks blocks requests without these — they check User-Agent and Referer
# to prevent external scripts from hammering their API.
BROWSER_HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Referer": "https://www.nycgovparks.org/permits/field-and-court/map",
}

# These are the sport keywords that actually appear in field ID strings
# returned by the NYC Parks API. Confirmed by parsing a live API response.
# Sports like Netball, Rugby, Bocce, Lacrosse, Kickball, Frisbee, T-Ball,
# and Track & Field do not appear as field ID keywords — they are filterable
# only via vector tile metadata (sport IDs), not the availability API.
SPORT_KEYWORDS = {
    "all":        None,
    "baseball":   "BASEBALL",
    "basketball": "BASKETBALL",
    "cricket":    "CRICKET",
    "football":   "FOOTBALL",
    "handball":   "HANDBALL",
    "hockey":     "HOCKEY",
    "soccer":     "SOCCER",
    "softball":   "SOFTBALL",
    "tennis":     "TENNIS",
    "volleyball": "VOLLEYBALL",
}

@app.get("/sports")
def get_sports():
    return [{"value": k, "label": k.title()} for k in SPORT_KEYWORDS.keys()]

@app.get("/availability")
async def get_availability(
    sport: str = Query(default="soccer"),
    start: date = Query(...),
    end:   date = Query(...),
):
    # Cap at 14 days to avoid hammering the NYC Parks API
    if (end - start).days > 14:
        end = start + timedelta(days=13)

    keyword = SPORT_KEYWORDS.get(sport.lower())
    availability = {}

    async with httpx.AsyncClient(timeout=10.0, headers=BROWSER_HEADERS) as client:
        current = start
        while current <= end:
            url = f"https://www.nycgovparks.org/api/athletic-fields?datetime={current}+09:00"
            try:
                resp = await client.get(url)
                data = resp.json()
                fields = data.get("l", [])
                if keyword:
                    fields = [f for f in fields if keyword in f.upper()]
                availability[str(current)] = sorted(fields)
            except Exception:
                availability[str(current)] = []

            current += timedelta(days=1)

    all_fields = sorted(set(
        field
        for fields in availability.values()
        for field in fields
    ))

    return {
        "sport":        sport,
        "start":        str(start),
        "end":          str(end),
        "fields":       all_fields,
        "availability": availability,
    }