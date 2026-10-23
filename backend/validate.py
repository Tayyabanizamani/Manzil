"""Cleans AI output so the frontend never breaks. No external dependencies."""
PRIORITIES = {"critical": "Critical", "important": "Important",
              "nice-to-have": "Nice-to-have", "nice to have": "Nice-to-have"}

def _clamp(v, lo, hi, default=0):
    try:
        return max(lo, min(hi, int(round(float(v)))))
    except (TypeError, ValueError):
        return default

def normalize(d, weeks):
    if not isinstance(d, dict):
        raise ValueError("AI output is not an object")
    skills = []
    for s in d.get("skills", []):
        if not isinstance(s, dict) or not s.get("name"):
            continue
        skills.append({
            "name": str(s["name"])[:60],
            "required_level": _clamp(s.get("required_level"), 0, 5),
            "current_level": _clamp(s.get("current_level"), 0, 5),
            "priority": PRIORITIES.get(str(s.get("priority", "")).strip().lower(), "Important"),
        })
    if len(skills) < 3:
        raise ValueError("Too few skills returned")

    roadmap = []
    for i, w in enumerate(d.get("roadmap", [])[:weeks], start=1):
        if not isinstance(w, dict):
            continue
        roadmap.append({
            "week": i,
            "focus": str(w.get("focus", f"Week {i}"))[:120],
            "tasks": [str(t) for t in w.get("tasks", [])][:6],
            "resources": [{"name": str(r.get("name", ""))[:80], "type": str(r.get("type", "article"))}
                          for r in w.get("resources", []) if isinstance(r, dict) and r.get("name")][:4],
            "milestone": str(w.get("milestone", "")),
        })
    if not roadmap:
        raise ValueError("Empty roadmap")

    proj = d.get("project") if isinstance(d.get("project"), dict) else {}
    return {
        "job_title": str(d.get("job_title", "Your target job")),
        "match_score": _clamp(d.get("match_score"), 0, 100),
        "summary": str(d.get("summary", "")),
        "skills": skills,
        "roadmap": roadmap,
        "project": {"title": str(proj.get("title", "Portfolio project")),
                    "description": str(proj.get("description", ""))},
        "interview_tips": [str(t) for t in d.get("interview_tips", [])][:5],
    }
