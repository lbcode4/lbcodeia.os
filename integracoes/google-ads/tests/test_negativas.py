import unittest
from unittest.mock import MagicMock

from negativas import build_query, parse_search_terms


class TestBuildQuery(unittest.TestCase):
    def test_query_inclui_search_term_view_e_periodo(self):
        q = build_query(days=30)
        self.assertIn("search_term_view", q)
        self.assertIn("metrics.cost_micros", q)
        self.assertIn("LAST_30_DAYS", q)


class TestParseSearchTerms(unittest.TestCase):
    def _row(self, term, clicks, cost_micros, conversions):
        r = MagicMock()
        r.search_term_view.search_term = term
        r.metrics.clicks = clicks
        r.metrics.cost_micros = cost_micros
        r.metrics.conversions = conversions
        return r

    def test_parse_extrai_termos_com_custo_em_reais(self):
        batch = MagicMock()
        batch.results = [self._row("curso gratis", 10, 5_000_000, 0)]
        termos = parse_search_terms([batch])
        self.assertEqual(len(termos), 1)
        self.assertEqual(termos[0]["termo"], "curso gratis")
        self.assertEqual(termos[0]["clicks"], 10)
        self.assertEqual(termos[0]["custo"], 5.0)
        self.assertEqual(termos[0]["conversoes"], 0)

    def test_parse_agrega_multiplos_batches(self):
        b1 = MagicMock(); b1.results = [self._row("a", 1, 1_000_000, 0)]
        b2 = MagicMock(); b2.results = [self._row("b", 2, 2_000_000, 1)]
        termos = parse_search_terms([b1, b2])
        self.assertEqual(len(termos), 2)


if __name__ == "__main__":
    unittest.main()
