import unittest

from utils import fmt_brl, fmt_pct, safe_div, fmt_cost, normalizar


class TestUtils(unittest.TestCase):
    def test_fmt_brl(self):
        self.assertEqual(fmt_brl(1234.56), "R$ 1.234,56")

    def test_fmt_pct(self):
        self.assertEqual(fmt_pct(9.4), "9,40%")

    def test_safe_div_normal(self):
        self.assertEqual(safe_div(10, 2), 5)

    def test_safe_div_zero(self):
        self.assertEqual(safe_div(10, 0), 0)

    def test_fmt_cost_micros(self):
        self.assertEqual(fmt_cost(1_000_000), 1.0)

    def test_normalizar_remove_acento(self):
        self.assertEqual(normalizar("Açaí"), "acai")


if __name__ == "__main__":
    unittest.main()
