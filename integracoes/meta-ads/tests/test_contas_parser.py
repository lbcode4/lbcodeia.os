import os
import sys
import unittest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", "comum"))

from contas_parser import (
    VALORES_VAZIOS,
    limpar_valor,
    extrair_agencia,
    parsear_tabela_multi,
    parsear_tabela_legado,
)

MULTI = """# Agência Demo — Workspace

## Contas Conectadas

| Cliente | Meta Ad Account | IG User ID | Handle IG | Google Ads ID | Ativo |
|---------|-----------------|------------|-----------|---------------|-------|
| Dordrian Store | `act_123` | 999 | @dordrian | — | sim |
| Loja Beta | act_XXXXXXXXX | 888 | @beta | 111-222 | sim |

## Outra Seção
| nao | parsear |
"""

LEGADO = """# Cliente X — Workspace

## Contas Conectadas

| Campo | Valor |
|-------|-------|
| Meta Ad Account ID | act_777 |
| Instagram User ID | 555 |
| Handle Instagram | @clientex |
| Google Ads Customer ID | 333-444 |
"""


class TestContasParser(unittest.TestCase):
    def test_limpar_valor_remove_backticks_e_placeholders(self):
        self.assertEqual(limpar_valor("`act_123`"), "act_123")
        self.assertEqual(limpar_valor("  —  "), "")
        self.assertEqual(limpar_valor("(preencher)"), "")
        # placeholder de conta Meta tratado como vazio (unificado entre dashboards)
        self.assertEqual(limpar_valor("act_XXXXXXXXX"), "")
        self.assertIn("act_XXXXXXXXX", VALORES_VAZIOS)

    def test_extrair_agencia_do_titulo(self):
        self.assertEqual(extrair_agencia(MULTI), "Agência Demo")
        self.assertEqual(extrair_agencia("sem titulo"), "Workspace")

    def test_parsear_multi_headers_e_linhas(self):
        headers, linhas = parsear_tabela_multi(MULTI)
        self.assertIn("cliente", headers)
        self.assertEqual(len(linhas), 2)
        self.assertEqual(linhas[0]["cliente"], "Dordrian Store")
        self.assertEqual(linhas[0]["meta ad account"], "act_123")  # backtick limpo
        self.assertEqual(linhas[1]["meta ad account"], "")          # placeholder vira vazio
        self.assertEqual(linhas[0]["google ads id"], "")            # — vira vazio

    def test_parsear_multi_para_na_proxima_secao(self):
        _, linhas = parsear_tabela_multi(MULTI)
        self.assertTrue(all(l.get("cliente") for l in linhas))

    def test_parsear_legado_retorna_dict_bruto(self):
        dados = parsear_tabela_legado(LEGADO)
        self.assertEqual(dados["Meta Ad Account ID"], "act_777")
        self.assertEqual(dados["Instagram User ID"], "555")
        self.assertEqual(dados["Google Ads Customer ID"], "333-444")
        self.assertNotIn("Campo", dados)


if __name__ == "__main__":
    unittest.main()
