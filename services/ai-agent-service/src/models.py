from __future__ import annotations

from typing import Any, Dict, List, Literal, Optional

from pydantic import BaseModel, Field


class HeadingInfo(BaseModel):
    level: str
    text: str


class ImageInfo(BaseModel):
    src: str
    alt: str
    hasAlt: bool


class DomData(BaseModel):
    title: str
    headings: List[HeadingInfo]
    images: List[ImageInfo]
    links: int
    buttons: int
    totalElements: int


class KeyboardFlow(BaseModel):
    totalTabStops: int
    tabSequence: List[str] = []
    analysis: Dict[str, Any] = {}


Severity = Literal["critical", "serious", "moderate", "minor"]


class Insight(BaseModel):
    id: str
    severity: Severity
    wcag: List[str]
    title: str
    rationale: str
    recommendation: str
    evidence: Dict[str, Any] = {}
    confidence: float = Field(ge=0, le=1, default=0.7)


class AnalyzeRequest(BaseModel):
    url: str
    scanId: str
    axeResults: Dict[str, Any]
    domData: DomData
    screenshotB64: Optional[str] = None
    keyboardFlow: Optional[KeyboardFlow] = None


class AnalyzeResponse(BaseModel):
    success: bool
    analysisId: str
    insights: List[Insight]
    summary: Dict[str, Any]
    durationMs: int


