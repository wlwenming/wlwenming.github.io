import unittest

from scripts.create_wechat_draft import build_article_html, validate_article


class WeChatDraftTests(unittest.TestCase):
    def test_article_html_escapes_content_and_keeps_source_links(self):
        article = {
            "title": "今日 AI",
            "digest": "热点摘要",
            "lead": "导语 <script>alert(1)</script>",
            "items": [{"id": 1, "summary": "进展", "insight": "观察"}],
            "outlook": "结语",
        }
        sources = [{
            "topic": "热点 <img src=x>",
            "refs": [
                {"name": "媒体", "url": "https://example.com/article?a=1&b=2"},
                {"name": "无效链接", "url": "javascript:alert(1)"},
            ],
        }]

        content = build_article_html(
            article, sources, "https://example.com/cover.png", "2026-10-19"
        )

        self.assertIn("&lt;script&gt;alert(1)&lt;/script&gt;", content)
        self.assertIn("&lt;img src=x&gt;", content)
        self.assertIn('href="https://example.com/article?a=1&amp;b=2"', content)
        self.assertNotIn("javascript:", content)
        self.assertIn("<img src=", content)

    def test_article_requires_every_hotspot_exactly_once_in_order(self):
        article = {
            "title": "标题",
            "digest": "摘要",
            "lead": "导语",
            "items": [
                {"id": 1, "summary": "摘要", "insight": "观察"},
                {"id": 2, "summary": "摘要", "insight": "观察"},
            ],
            "outlook": "结语",
        }

        validate_article(article, 2)
        article["items"].pop()
        with self.assertRaisesRegex(RuntimeError, "不完整"):
            validate_article(article, 2)


if __name__ == "__main__":
    unittest.main()
