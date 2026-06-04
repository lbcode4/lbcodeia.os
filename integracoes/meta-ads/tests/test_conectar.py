import unittest
from unittest.mock import MagicMock

from conectar import listar_contas

MOCK_ADACCOUNTS = {"data": [
    {"id": "act_123", "name": "Cliente A", "account_status": 1},
    {"id": "act_456", "name": "Cliente B", "account_status": 2},
]}


class TestListarContas(unittest.TestCase):
    def test_lista_contas_com_status_mapeado(self):
        client = MagicMock()
        client.get.return_value = MOCK_ADACCOUNTS
        contas = listar_contas(client)
        self.assertEqual(len(contas), 2)
        self.assertEqual(contas[0]["id"], "act_123")
        self.assertEqual(contas[0]["name"], "Cliente A")
        self.assertEqual(contas[0]["status"], "ATIVO")
        self.assertEqual(contas[1]["status"], "DESATIVADO")

    def test_chama_endpoint_adaccounts(self):
        client = MagicMock()
        client.get.return_value = {"data": []}
        listar_contas(client)
        client.get.assert_called_once()
        endpoint = client.get.call_args[0][0]
        self.assertIn("adaccounts", endpoint)

    def test_lista_vazia(self):
        client = MagicMock()
        client.get.return_value = {"data": []}
        self.assertEqual(listar_contas(client), [])

    def test_status_desconhecido_passa_cru(self):
        client = MagicMock()
        client.get.return_value = {"data": [{"id": "act_9", "name": "X", "account_status": 99}]}
        contas = listar_contas(client)
        self.assertEqual(contas[0]["status"], 99)


if __name__ == "__main__":
    unittest.main()
