import unittest
from unittest.mock import patch, MagicMock
import json
import os
import tempfile


MOCK_ADS = {"data": [
    {"id": "ad_001", "name": "AD Store 2 Objeção", "status": "ACTIVE", "adset_id": "adset_1"},
    {"id": "ad_002", "name": "AD Store 2 Prova Social", "status": "ACTIVE", "adset_id": "adset_2"},
]}


class TestSearchAds(unittest.TestCase):
    def setUp(self):
        os.environ["META_ACCESS_TOKEN"] = "test_token"
        os.environ["META_AD_ACCOUNT_ID"] = "act_123"

    def tearDown(self):
        os.environ.pop("META_ACCESS_TOKEN", None)
        os.environ.pop("META_AD_ACCOUNT_ID", None)

    @patch("gerenciar.MetaAPIClient")
    def test_search_returns_ad_list(self, MockClient):
        from gerenciar import search_ads
        client = MockClient.return_value
        client.account_id = "act_123"
        client.get.return_value = MOCK_ADS

        ads = search_ads(client, "Store 2")

        self.assertEqual(len(ads), 2)

    @patch("gerenciar.MetaAPIClient")
    def test_search_passes_name_in_filtering(self, MockClient):
        from gerenciar import search_ads
        client = MockClient.return_value
        client.account_id = "act_123"
        client.get.return_value = MOCK_ADS

        search_ads(client, "Store 2")

        call_params = client.get.call_args[0][1]
        filtering = json.loads(call_params["filtering"])
        self.assertEqual(filtering[0]["value"], "Store 2")
        self.assertEqual(filtering[0]["operator"], "CONTAIN")


class TestSetAdStatus(unittest.TestCase):
    def setUp(self):
        os.environ["META_ACCESS_TOKEN"] = "test_token"
        os.environ["META_AD_ACCOUNT_ID"] = "act_123"

    def tearDown(self):
        os.environ.pop("META_ACCESS_TOKEN", None)
        os.environ.pop("META_AD_ACCOUNT_ID", None)

    @patch("gerenciar.MetaAPIClient")
    def test_pause_posts_paused_status(self, MockClient):
        from gerenciar import set_ad_status
        client = MockClient.return_value
        client.post.return_value = {"success": True}

        result = set_ad_status(client, "ad_001", "PAUSED")

        client.post.assert_called_once_with("ad_001", {"status": "PAUSED"})
        self.assertTrue(result["success"])

    @patch("gerenciar.MetaAPIClient")
    def test_activate_posts_active_status(self, MockClient):
        from gerenciar import set_ad_status
        client = MockClient.return_value
        client.post.return_value = {"success": True}

        set_ad_status(client, "ad_001", "ACTIVE")

        client.post.assert_called_once_with("ad_001", {"status": "ACTIVE"})


class TestLogAction(unittest.TestCase):
    def test_creates_log_file_with_action(self):
        from gerenciar import log_action
        with tempfile.TemporaryDirectory() as tmpdir:
            log_path = os.path.join(tmpdir, "acoes-log.json")
            with patch("gerenciar.LOG_FILE", log_path):
                log_action("pause", "ad_001", "AD Store 2", "ACTIVE")

            with open(log_path) as f:
                log = json.load(f)

            self.assertEqual(len(log), 1)
            self.assertEqual(log[0]["action"], "pause")
            self.assertEqual(log[0]["ad_id"], "ad_001")
            self.assertEqual(log[0]["previous_status"], "ACTIVE")
            self.assertIn("timestamp", log[0])

    def test_appends_to_existing_log(self):
        from gerenciar import log_action
        with tempfile.TemporaryDirectory() as tmpdir:
            log_path = os.path.join(tmpdir, "acoes-log.json")
            with open(log_path, "w") as f:
                json.dump([{"existing": "entry"}], f)

            with patch("gerenciar.LOG_FILE", log_path):
                log_action("activate", "ad_002", "AD Store 1", "PAUSED")

            with open(log_path) as f:
                log = json.load(f)

            self.assertEqual(len(log), 2)
            self.assertEqual(log[1]["action"], "activate")
