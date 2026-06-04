# tests/test_criativos.py
import unittest
from unittest.mock import MagicMock
import os


class TestFetchTopCreatives(unittest.TestCase):
    def setUp(self):
        os.environ["META_ACCESS_TOKEN"] = "test_token"
        os.environ["META_AD_ACCOUNT_ID"] = "act_123"

    def tearDown(self):
        os.environ.pop("META_ACCESS_TOKEN", None)
        os.environ.pop("META_AD_ACCOUNT_ID", None)

    def _make_ad(self, ad_id, name, spend, ctr, body="copy", title="title"):
        return {
            "id": ad_id,
            "name": name,
            "creative": {"body": body, "title": title},
            "insights": {"data": [{"spend": str(spend), "ctr": str(ctr),
                                   "clicks": "10", "actions": []}]}
        }

    def test_filters_ads_with_spend_below_10(self):
        from criativos import fetch_top_creatives
        client = MagicMock()
        client.account_id = "act_123"
        client.get.return_value = {"data": [
            self._make_ad("ad1", "Low Spend", 5.0, 3.5),
            self._make_ad("ad2", "High Spend", 50.0, 2.0),
        ]}

        result = fetch_top_creatives(client, limit=10, days=30)

        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["ad_id"], "ad2")

    def test_sorts_by_ctr_descending(self):
        from criativos import fetch_top_creatives
        client = MagicMock()
        client.account_id = "act_123"
        client.get.return_value = {"data": [
            self._make_ad("ad1", "Low CTR", 20.0, 1.5),
            self._make_ad("ad2", "High CTR", 30.0, 3.0),
        ]}

        result = fetch_top_creatives(client, limit=10, days=30)

        self.assertEqual(result[0]["ad_id"], "ad2")
        self.assertEqual(result[1]["ad_id"], "ad1")

    def test_respects_limit(self):
        from criativos import fetch_top_creatives
        client = MagicMock()
        client.account_id = "act_123"
        client.get.return_value = {"data": [
            self._make_ad(f"ad{i}", f"Ad {i}", 20.0, float(i))
            for i in range(1, 6)
        ]}

        result = fetch_top_creatives(client, limit=2, days=30)

        self.assertEqual(len(result), 2)

    def test_counts_purchases_from_actions(self):
        from criativos import fetch_top_creatives
        client = MagicMock()
        client.account_id = "act_123"
        client.get.return_value = {"data": [{
            "id": "ad1", "name": "Ad",
            "creative": {"body": "copy", "title": "t"},
            "insights": {"data": [{"spend": "20.00", "ctr": "2.0", "clicks": "40",
                                   "actions": [{"action_type": "purchase", "value": "3"},
                                               {"action_type": "link_click", "value": "40"}]}]}
        }]}

        result = fetch_top_creatives(client, limit=10, days=30)

        self.assertEqual(result[0]["purchases"], 3)

    def test_falls_back_to_link_data_when_no_creative_body(self):
        from criativos import fetch_top_creatives
        client = MagicMock()
        client.account_id = "act_123"
        client.get.return_value = {"data": [{
            "id": "ad1", "name": "Ad",
            "creative": {
                "object_story_spec": {"link_data": {"message": "fallback body", "name": "fallback title"}}
            },
            "insights": {"data": [{"spend": "20.00", "ctr": "2.0", "clicks": "40", "actions": []}]}
        }]}

        result = fetch_top_creatives(client, limit=10, days=30)

        self.assertEqual(result[0]["body"], "fallback body")
        self.assertEqual(result[0]["title"], "fallback title")
