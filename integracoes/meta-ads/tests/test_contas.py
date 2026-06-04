import os
import tempfile
import unittest

from contas import parse_contas, resolver_cliente, ContaError

TABELA = """# Contas

## Contas Conectadas

| Cliente | Meta Ad Account | IG User ID | Handle IG | Google Ads ID | Ativo |
|---------|-----------------|------------|-----------|---------------|-------|
| Dordrian Store | act_123 | 999 | @dordrian | — | sim |
| Loja Beta | act_456 | 888 | @beta | 111-222 | sim |
"""


class TestParseContas(unittest.TestCase):
    def _write(self, conteudo):
        f = tempfile.NamedTemporaryFile("w", suffix=".md", delete=False, encoding="utf-8")
        f.write(conteudo)
        f.close()
        return f.name

    def test_parse_retorna_todos_clientes(self):
        path = self._write(TABELA)
        contas = parse_contas(path)
        self.assertEqual(len(contas), 2)
        self.assertEqual(contas[0]["cliente"], "Dordrian Store")
        self.assertEqual(contas[0]["meta_ad_account"], "act_123")

    def test_resolver_por_nome_parcial_case_insensitive(self):
        path = self._write(TABELA)
        conta = resolver_cliente(path, "dordrian")
        self.assertEqual(conta["meta_ad_account"], "act_123")

    def test_resolver_unico_cliente_sem_filtro(self):
        path = self._write(TABELA.replace("| Loja Beta | act_456 | 888 | @beta | 111-222 | sim |\n", ""))
        conta = resolver_cliente(path, None)
        self.assertEqual(conta["meta_ad_account"], "act_123")

    def test_resolver_multiplos_sem_filtro_erra(self):
        path = self._write(TABELA)
        with self.assertRaises(ContaError):
            resolver_cliente(path, None)

    def test_resolver_cliente_inexistente_erra(self):
        path = self._write(TABELA)
        with self.assertRaises(ContaError):
            resolver_cliente(path, "inexistente")

    def test_arquivo_ausente_erra(self):
        with self.assertRaises(ContaError):
            parse_contas("/tmp/nao_existe_xyz.md")


if __name__ == "__main__":
    unittest.main()
