from __future__ import annotations

from uuid import uuid4

from ..models import DomData, Insight


def analyze_headings(dom: DomData) -> list[Insight]:
    insights: list[Insight] = []
    h1s = [h for h in dom.headings if h.level.upper() == "H1"]

    if len(h1s) == 0:
        insights.append(
            Insight(
                id=str(uuid4()),
                severity="serious",
                wcag=["1.3.1", "2.4.6"],
                title="Missing H1",
                rationale=(
                    "A page should have a single, descriptive H1 for document structure and navigation."
                ),
                recommendation="Add one H1 that clearly describes the page’s main purpose.",
                evidence={"headings": [h.model_dump() for h in dom.headings]},
                confidence=0.9,
            )
        )

    if len(h1s) > 1:
        insights.append(
            Insight(
                id=str(uuid4()),
                severity="moderate",
                wcag=["1.3.1", "2.4.6"],
                title="Multiple H1s",
                rationale="Multiple H1s can confuse assistive technology users.",
                recommendation="Keep one H1; demote the others to H2/H3 as appropriate.",
                evidence={"count": len(h1s)},
                confidence=0.8,
            )
        )

    return insights


