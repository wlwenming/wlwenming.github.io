#!/usr/bin/env python3
"""Fetch Chinese AI RSS feeds and update the latest/archive data files."""

import email.utils
import html
import json
import re
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from datetime import datetime, timedelta, timezone
from pathlib import Path
from zoneinfo import ZoneInfo


ROOT = Path(__file__).resolve().parents[1]
LATEST_FILE = ROOT / "assets/data/ai-hot-latest.js"
HISTORY_FILE = ROOT / "assets/data/ai-hot-history.js"
NOW = datetime.now(ZoneInfo("Asia/Shanghai"))
TODAY = NOW.date()
AI_TERMS = (
    "AI", "AIGC", "Agent", "智能体", "大模型", "人工智能", "机器学习", "深度学习",
    "生成式", "多模态", "机器人", "算力", "芯片", "量子", "具身", "自动驾驶",
    "蛋白质", "药物", "科学计算", "GPU", "LLM", "RAG", "模型"
)
FEEDS = (
    ("量子位", "https://www.qbitai.com/feed"),
    ("InfoQ", "https://www.infoq.cn/feed"),
    ("IT之家", "https://www.ithome.com/rss/"),
)


def fetch(url):
    request = urllib.request.Request(url, headers={"User-Agent": "home-ai-hot-bot/1.0"})
    with urllib.request.urlopen(request, timeout=30) as response:
        return response.read()


def text(value):
    value = html.unescape(value or "")
    value = re.sub(r"<[^>]+>", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def item_date(item):
    raw = item.findtext("pubDate") or item.findtext("{http://purl.org/dc/elements/1.1/}date")
    if not raw:
        return None
    try:
        parsed = email.utils.parsedate_to_datetime(raw)
        if parsed.tzinfo is None:
            parsed = parsed.replace(tzinfo=timezone.utc)
        return parsed.astimezone(ZoneInfo("Asia/Shanghai"))
    except (TypeError, ValueError, IndexError):
        return None


def parse_feed(source, url):
    root = ET.fromstring(fetch(url))
    entries = []
    for item in root.findall(".//item"):
        title = text(item.findtext("title"))
        link = text(item.findtext("link"))
        if not title or not link or not any(term.lower() in title.lower() for term in AI_TERMS):
            continue
        published = item_date(item)
        if published and published.date() != TODAY:
            continue
        description = text(item.findtext("description"))
        link_parts = urllib.parse.urlsplit(link)
        clean_link = urllib.parse.urlunsplit((link_parts.scheme, link_parts.netloc, link_parts.path, "", ""))
        entries.append({
            "topic": title,
            "progress": description[:260] or "该文章报道了人工智能技术领域的最新进展。",
            "refs": [{"name": source, "url": clean_link}],
            "published": published.isoformat() if published else "",
        })
    return entries


def read_js(path, variable, fallback):
    if not path.exists():
        return fallback
    content = path.read_text(encoding="utf-8")
    match = re.search(r"window\." + re.escape(variable) + r"\s*=\s*(\{.*?\}|\[.*?\]);?\s*$", content, re.S)
    return json.loads(match.group(1)) if match else fallback


def write_js(path, variable, value):
    path.write_text(
        "window." + variable + " = " + json.dumps(value, ensure_ascii=False, indent=2) + ";\n",
        encoding="utf-8",
    )


def main():
    entries = []
    failures = []
    for source, feed in FEEDS:
        try:
            entries.extend(parse_feed(source, feed))
        except Exception as error:  # One unavailable feed must not hide other sources.
            failures.append(source + ": " + str(error))

    unique = {}
    for entry in entries:
        unique.setdefault(entry["topic"], entry)
    entries = list(unique.values())[:10]
    if len(entries) < 5:
        raise RuntimeError("可用中文 AI 资讯不足 5 条：" + "；".join(failures))

    directions = []
    direction_map = (
        ("智能体", "AI Agent"), ("大模型", "大模型"), ("机器人", "具身智能"),
        ("算力", "算力芯片"), ("芯片", "算力芯片"), ("量子", "AI for Science"),
        ("蛋白质", "AI for Science"),
    )
    titles = " ".join(entry["topic"] for entry in entries)
    for keyword, direction in direction_map:
        if keyword in titles and direction not in directions:
            directions.append(direction)
    if not directions:
        directions.append("大模型与人工智能应用")

    latest = {
        "date": TODAY.isoformat(),
        "updated_at": NOW.strftime("%Y-%m-%d %H:%M:%S"),
        "overview": "今日中文 AI 资讯聚焦 " + "、".join(directions) + "，数据来自量子位、InfoQ、IT之家等中文科技资讯源。",
        "items": [{key: value for key, value in entry.items() if key != "published"} for entry in entries],
    }
    old_latest = read_js(LATEST_FILE, "AI_HOT_LATEST", None)
    old_history = read_js(HISTORY_FILE, "AI_HOT_HISTORY", [])
    archive = ([old_latest] if old_latest else []) + old_history
    seen_versions = set()
    unique_archive = []
    for item in archive:
        version = item.get("updated_at") or item.get("date")
        if item and version not in seen_versions:
            seen_versions.add(version)
            unique_archive.append(item)
    write_js(LATEST_FILE, "AI_HOT_LATEST", latest)
    write_js(HISTORY_FILE, "AI_HOT_HISTORY", unique_archive)
    print("已生成", len(entries), "条热点，时间", latest["updated_at"], "历史", len(unique_archive), "条")


if __name__ == "__main__":
    main()