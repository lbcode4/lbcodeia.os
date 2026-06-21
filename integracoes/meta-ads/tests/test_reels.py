# tests/test_reels.py
import unittest
from unittest.mock import MagicMock
from meta_api import MetaAPIError
import os


class TestGetIgUserId(unittest.TestCase):
    def setUp(self):
        os.environ["META_ACCESS_TOKEN"] = "test_token"
        os.environ["META_AD_ACCOUNT_ID"] = "act_123"

    def tearDown(self):
        os.environ.pop("META_ACCESS_TOKEN", None)
        os.environ.pop("META_AD_ACCOUNT_ID", None)

    def test_returns_ig_user_id(self):
        from reels import get_ig_user_id
        client = MagicMock()
        client.account_id = "act_123"
        client.get.return_value = {"instagram_actor_id": "ig_456"}

        result = get_ig_user_id(client)

        self.assertEqual(result, "ig_456")

    def test_raises_when_no_instagram_linked(self):
        from reels import get_ig_user_id
        client = MagicMock()
        client.account_id = "act_123"
        client.get.return_value = {}

        with self.assertRaises(MetaAPIError):
            get_ig_user_id(client)


class TestFetchReels(unittest.TestCase):
    def setUp(self):
        os.environ["META_ACCESS_TOKEN"] = "test_token"
        os.environ["META_AD_ACCOUNT_ID"] = "act_123"

    def tearDown(self):
        os.environ.pop("META_ACCESS_TOKEN", None)
        os.environ.pop("META_AD_ACCOUNT_ID", None)

    def _make_client(self, ig_id, media_items, insights_per_item):
        client = MagicMock()
        client.account_id = "act_123"
        side_effects = [
            {"instagram_actor_id": ig_id},
            {"data": media_items},
        ] + insights_per_item
        client.get.side_effect = side_effects
        return client

    def test_calculates_engagement_rate(self):
        from reels import fetch_reels
        client = self._make_client("ig_456", [
            {"id": "r1", "media_type": "REEL", "caption": "test",
             "timestamp": "2026-01-01T10:00:00+0000",
             "like_count": 100, "comments_count": 10}
        ], [
            {"data": [
                {"name": "reach", "values": [{"value": 1000}]},
                {"name": "plays", "values": [{"value": 500}]},
                {"name": "saved", "values": [{"value": 50}]},
                {"name": "shares", "values": [{"value": 20}]},
            ]}
        ])

        result = fetch_reels(client, days=30, limit=50)

        # (100 + 10 + 20 + 50) / 1000 * 100 = 18.0
        self.assertEqual(len(result), 1)
        self.assertAlmostEqual(result[0]["engagement_rate"], 18.0)

    def test_skips_non_video_media(self):
        from reels import fetch_reels
        client = self._make_client("ig_456", [
            {"id": "img1", "media_type": "IMAGE", "caption": "photo",
             "timestamp": "2026-01-01T10:00:00+0000",
             "like_count": 50, "comments_count": 5},
            {"id": "r1", "media_type": "REEL", "caption": "reel",
             "timestamp": "2026-01-01T11:00:00+0000",
             "like_count": 100, "comments_count": 10}
        ], [
            {"data": [
                {"name": "reach", "values": [{"value": 500}]},
                {"name": "plays", "values": [{"value": 200}]},
                {"name": "saved", "values": [{"value": 10}]},
                {"name": "shares", "values": [{"value": 5}]},
            ]}
        ])

        result = fetch_reels(client, days=30, limit=50)

        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["id"], "r1")

    def test_watch_time_converted_from_ms_to_seconds(self):
        from reels import fetch_reels
        client = self._make_client("ig_456", [
            {"id": "r1", "media_type": "REEL", "caption": "test",
             "timestamp": "2026-01-01T10:00:00+0000",
             "like_count": 100, "comments_count": 10}
        ], [
            {"data": [
                {"name": "reach", "values": [{"value": 1000}]},
                {"name": "saved", "values": [{"value": 50}]},
                {"name": "shares", "values": [{"value": 20}]},
                {"name": "ig_reels_avg_watch_time", "values": [{"value": 4400}]},
            ]}
        ])

        result = fetch_reels(client, days=30, limit=50)

        # 4400 ms / 1000 = 4.4 s
        self.assertAlmostEqual(result[0]["watch"], 4.4)

    def test_watch_defaults_to_zero_when_metric_missing(self):
        from reels import fetch_reels
        client = self._make_client("ig_456", [
            {"id": "r1", "media_type": "REEL", "caption": "",
             "timestamp": "2026-01-01T10:00:00+0000",
             "like_count": 10, "comments_count": 2}
        ], [
            {"data": [
                {"name": "reach", "values": [{"value": 500}]},
                {"name": "saved", "values": [{"value": 1}]},
                {"name": "shares", "values": [{"value": 1}]},
            ]}
        ])

        result = fetch_reels(client, days=30, limit=50)

        self.assertEqual(result[0]["watch"], 0.0)

    def test_zero_reach_returns_zero_engagement_rate(self):
        from reels import fetch_reels
        client = self._make_client("ig_456", [
            {"id": "r1", "media_type": "REEL", "caption": "",
             "timestamp": "2026-01-01T10:00:00+0000",
             "like_count": 10, "comments_count": 2}
        ], [
            {"data": [
                {"name": "reach", "values": [{"value": 0}]},
                {"name": "plays", "values": [{"value": 0}]},
                {"name": "saved", "values": [{"value": 0}]},
                {"name": "shares", "values": [{"value": 0}]},
            ]}
        ])

        result = fetch_reels(client, days=30, limit=50)

        self.assertEqual(result[0]["engagement_rate"], 0.0)

    def test_sorts_by_engagement_rate_descending(self):
        from reels import fetch_reels
        client = MagicMock()
        client.account_id = "act_123"
        client.get.side_effect = [
            {"instagram_actor_id": "ig_456"},
            {"data": [
                {"id": "r1", "media_type": "REEL", "caption": "",
                 "timestamp": "2026-01-01T10:00:00+0000",
                 "like_count": 10, "comments_count": 0},
                {"id": "r2", "media_type": "REEL", "caption": "",
                 "timestamp": "2026-01-01T11:00:00+0000",
                 "like_count": 200, "comments_count": 50},
            ]},
            {"data": [  # insights for r1
                {"name": "reach", "values": [{"value": 1000}]},
                {"name": "plays", "values": [{"value": 100}]},
                {"name": "saved", "values": [{"value": 5}]},
                {"name": "shares", "values": [{"value": 5}]},
            ]},
            {"data": [  # insights for r2
                {"name": "reach", "values": [{"value": 1000}]},
                {"name": "plays", "values": [{"value": 400}]},
                {"name": "saved", "values": [{"value": 80}]},
                {"name": "shares", "values": [{"value": 30}]},
            ]},
        ]

        result = fetch_reels(client, days=30, limit=50)

        self.assertEqual(result[0]["id"], "r2")
        self.assertEqual(result[1]["id"], "r1")
