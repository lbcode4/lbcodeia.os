# tests/test_auditoria.py
import unittest
from unittest.mock import MagicMock
import os

MOCK_INSIGHTS = {"data": [
    {"campaign_id": "c1", "campaign_name": "ToFu > Trafego",
     "adset_id": "as1", "adset_name": "Conjunto 1",
     "spend": "100.00", "impressions": "10000", "frequency": "2.1",
     "publisher_platform": "facebook",
     "actions": [{"action_type": "purchase", "value": "2"}],
     "cpm": "10.00"}
]}

MOCK_CAMPAIGNS = {"data": [
    {"id": "c1", "name": "ToFu > Trafego", "status": "ACTIVE", "daily_budget": "3000"}
]}


class TestFetchAuditData(unittest.TestCase):
    def setUp(self):
        os.environ["META_ACCESS_TOKEN"] = "test_token"
        os.environ["META_AD_ACCOUNT_ID"] = "act_123"

    def tearDown(self):
        os.environ.pop("META_ACCESS_TOKEN", None)
        os.environ.pop("META_AD_ACCOUNT_ID", None)

    def test_returns_insights_and_campaigns(self):
        from auditoria import fetch_audit_data
        client = MagicMock()
        client.account_id = "act_123"
        client.get.side_effect = [MOCK_INSIGHTS, MOCK_CAMPAIGNS]

        result = fetch_audit_data(client, days=30)

        self.assertEqual(len(result["insights"]), 1)
        self.assertEqual(len(result["campaigns"]), 1)
        self.assertEqual(result["days"], 30)

    def test_insights_call_uses_adset_level_with_breakdown(self):
        from auditoria import fetch_audit_data
        client = MagicMock()
        client.account_id = "act_123"
        client.get.side_effect = [MOCK_INSIGHTS, MOCK_CAMPAIGNS]

        fetch_audit_data(client, days=30)

        insights_call = client.get.call_args_list[0]
        params = insights_call[0][1]
        self.assertEqual(params["level"], "adset")
        self.assertIn("publisher_platform", params["breakdowns"])

    def test_uses_correct_date_preset(self):
        from auditoria import fetch_audit_data
        client = MagicMock()
        client.account_id = "act_123"
        client.get.side_effect = [MOCK_INSIGHTS, MOCK_CAMPAIGNS]

        fetch_audit_data(client, days=7)

        insights_call = client.get.call_args_list[0]
        params = insights_call[0][1]
        self.assertEqual(params["date_preset"], "last_7d")
