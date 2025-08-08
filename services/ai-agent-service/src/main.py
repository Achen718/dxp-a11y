from __future__ import annotations

from time import perf_counter
from uuid import uuid4

from fastapi import FastAPI, HTTPException

from .analyzers.headings import analyze_headings
from .analyzers.links import analyze_links
from .models import AnalyzeRequest, AnalyzeResponse, Insight


app = FastAPI(title="AI Agent Service", version="0.1.0")


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "OK", "service": "ai-agent-service"}


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(body: AnalyzeRequest) -> AnalyzeResponse:
    start = perf_counter()
    try:
        insights: list[Insight] = []
        insights += analyze_headings(body.domData)
        insights += analyze_links(body.domData)

        by_severity = {"critical": 0, "serious": 0, "moderate": 0, "minor": 0}
        for i in insights:
            by_severity[i.severity] += 1

        return AnalyzeResponse(
            success=True,
            analysisId=str(uuid4()),
            insights=insights,
            summary={"totalInsights": len(insights), "bySeverity": by_severity},
            durationMs=int((perf_counter() - start) * 1000),
        )
    except Exception as e:  # noqa: BLE001 - return friendly error to client
        raise HTTPException(status_code=400, detail=str(e))


