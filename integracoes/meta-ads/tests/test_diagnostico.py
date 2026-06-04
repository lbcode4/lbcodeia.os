import unittest
from unittest.mock import patch, MagicMock
import os


MOCK_CAMPAIGNS = {"data": [
    {"id": "cam_1", "name": "Campanha Vendas", "status": "ACTIVE", "daily_budget": "3000"},
    {"id": "cam_2", "name": "Campanha Trafego", "status": "ACTIVE", "daily_budget": "2000"},
]}

MOCK_INSIGHTS = {"data": [
    {
        "campaign_id": "cam_1",
        "campaign_name": "Campanha Vendas",
        "spend": "38.50",
        "impressions": "3000",
        "clicks": "38",
        "ctr": "1.27",
        "actions": [{"action_type": "purchase", "value": "2"}],
        "cost_per_action_type": [{"action_type": "purchase", "value": "19.25"}]
    }
]}


class TestFetchInsights(unittest.TestCase):
    def setUp(self):
        os.environ["META_ACCESS_TOKEN"] = "test_token"
        os.environ["META_AD_ACCOUNT_ID"] = "act_123"

    def tearDown(self):
        os.environ.pop("META_ACCESS_TOKEN", None)
        os.environ.pop("META_AD_ACCOUNT_ID", None)

    @patch("diagnostico.MetaAPIClient")
    def test_fetch_insights_returns_campaigns_and_insights(self, MockClient):
        from diagnostico import fetch_insights
        client = MockClient.return_value
        client.account_id = "act_123"
        client.get.side_effect = [MOCK_CAMPAIGNS, MOCK_INSIGHTS]

        result = fetch_insights(client, 7)

        self.assertEqual(len(result["campaigns"]), 2)
        self.assertEqual(len(result["insights"]), 1)
        self.assertEqual(result["days"], 7)

    @patch("diagnostico.MetaAPIClient")
    def test_fetch_insights_uses_correct_date_preset(self, MockClient):
        from diagnostico import fetch_insights
        client = MockClient.return_value
        client.account_id = "act_123"
        client.get.side_effect = [MOCK_CAMPAIGNS, MOCK_INSIGHTS]

        fetch_insights(client, 30)

        calls = client.get.call_args_list
        insights_call_params = calls[1][0][1]
        self.assertEqual(insights_call_params["date_preset"], "last_30d")


class TestCalculateKPIs(unittest.TestCase):
    def test_aggregates_spend_impressions_clicks(self):
        from diagnostico import calculate_kpis
        data = {
            "campaigns": MOCK_CAMPAIGNS["data"],
            "insights": MOCK_INSIGHTS["data"],
            "days": 7
        }
        kpis = calculate_kpis(data)

        self.assertEqual(kpis["total_spend"], 38.50)
        self.assertEqual(kpis["total_impressions"], 3000)
        self.assertEqual(kpis["total_clicks"], 38)

    def test_counts_purchases_from_actions(self):
        from diagnostico import calculate_kpis
        data = {"campaigns": [], "insights": MOCK_INSIGHTS["data"], "days": 7}
        kpis = calculate_kpis(data)
        self.assertEqual(kpis["total_purchases"], 2)

    def test_calculates_ctr(self):
        from diagnostico import calculate_kpis
        data = {"campaigns": [], "insights": MOCK_INSIGHTS["data"], "days": 7}
        kpis = calculate_kpis(data)
        expected_ctr = round(38 / 3000 * 100, 2)
        self.assertAlmostEqual(kpis["ctr"], expected_ctr, places=2)

    def test_calculates_cpl(self):
        from diagnostico import calculate_kpis
        data = {"campaigns": [], "insights": MOCK_INSIGHTS["data"], "days": 7}
        kpis = calculate_kpis(data)
        self.assertAlmostEqual(kpis["cpl"], 19.25, places=2)

    def test_zero_purchases_gives_zero_cpl(self):
        from diagnostico import calculate_kpis
        data = {
            "campaigns": [],
            "insights": [{"spend": "10", "impressions": "100", "clicks": "5", "ctr": "5.0", "actions": []}],
            "days": 7
        }
        kpis = calculate_kpis(data)
        self.assertEqual(kpis["total_purchases"], 0)
        self.assertEqual(kpis["cpl"], 0)

    def test_zero_impressions_gives_zero_ctr(self):
        from diagnostico import calculate_kpis
        data = {
            "campaigns": [],
            "insights": [{"spend": "0", "impressions": "0", "clicks": "0", "ctr": "0", "actions": []}],
            "days": 7
        }
        kpis = calculate_kpis(data)
        self.assertEqual(kpis["ctr"], 0)
