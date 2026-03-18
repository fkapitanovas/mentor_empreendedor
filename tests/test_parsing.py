"""Testes unitarios para funcoes de parsing em mentor.py."""
import pytest
from app.services.mentor import (
    _parse_tempo_meses,
    _parse_faturamento,
    _standardize_profile_fields,
    _extract_profile,
    _extract_profile_update,
)


# --- _parse_tempo_meses ---

class TestParseTempo:
    def test_anos(self):
        assert _parse_tempo_meses("2 anos") == 24

    def test_ano_singular(self):
        assert _parse_tempo_meses("1 ano") == 12

    def test_meses(self):
        assert _parse_tempo_meses("6 meses") == 6

    def test_mes_singular(self):
        assert _parse_tempo_meses("1 mes") == 1

    def test_ano_e_meio(self):
        assert _parse_tempo_meses("1 ano e meio") == 18

    def test_meio_sozinho(self):
        assert _parse_tempo_meses("meio ano") == 6

    def test_anos_e_meses(self):
        assert _parse_tempo_meses("2 anos e 3 meses") == 27

    def test_metade(self):
        # "1/2" e ambiguo — regex captura "2" como anos + 6 de "1/2"
        # Input real seria "meio ano" (testado em test_meio_sozinho)
        assert _parse_tempo_meses("1/2") == 6

    def test_none_vazio(self):
        assert _parse_tempo_meses("") is None

    def test_none_null(self):
        assert _parse_tempo_meses(None) is None

    def test_none_texto_irrelevante(self):
        assert _parse_tempo_meses("nao sei") is None

    def test_case_insensitive(self):
        assert _parse_tempo_meses("2 ANOS") == 24


# --- _parse_faturamento ---

class TestParseFaturamento:
    def test_mil(self):
        assert _parse_faturamento("5mil") == 5000

    def test_mil_com_espaco(self):
        assert _parse_faturamento("5 mil") == 5000

    def test_k(self):
        assert _parse_faturamento("15k") == 15000

    def test_reais_mil(self):
        assert _parse_faturamento("R$ 10.000/mês") == 10000

    def test_reais_simples(self):
        assert _parse_faturamento("R$ 5000") == 5000

    def test_reais_com_centavos(self):
        assert _parse_faturamento("10.000,00") == 10000

    def test_vinte_mil(self):
        assert _parse_faturamento("20mil") == 20000

    def test_com_virgula_mil(self):
        assert _parse_faturamento("2,5mil") == 2500

    def test_none_vazio(self):
        assert _parse_faturamento("") is None

    def test_none_null(self):
        assert _parse_faturamento(None) is None

    def test_none_texto(self):
        assert _parse_faturamento("nao sei") is None

    def test_valor_zero(self):
        assert _parse_faturamento("0") is None


# --- _standardize_profile_fields ---

class TestStandardizeProfile:
    def test_converte_ambos(self):
        data = {"tempo_negocio": "2 anos", "faturamento": "R$ 10.000/mês"}
        result = _standardize_profile_fields(data)
        assert result["tempo_negocio_meses"] == 24
        assert result["faturamento_mensal"] == 10000

    def test_mantem_campos_originais(self):
        data = {"tempo_negocio": "2 anos", "setor": "alimentacao"}
        result = _standardize_profile_fields(data)
        assert result["tempo_negocio"] == "2 anos"
        assert result["setor"] == "alimentacao"

    def test_claude_envia_inteiros_direto(self):
        data = {"tempo_negocio_meses": 36, "faturamento_mensal": 20000}
        result = _standardize_profile_fields(data)
        assert result["tempo_negocio_meses"] == 36
        assert result["faturamento_mensal"] == 20000

    def test_sem_campos_parseaeis(self):
        data = {"setor": "beleza", "name": "Maria"}
        result = _standardize_profile_fields(data)
        assert "tempo_negocio_meses" not in result
        assert "faturamento_mensal" not in result


# --- _extract_profile ---

class TestExtractProfile:
    def test_extrai_json(self):
        text = 'Ola! [PERFIL_EXTRAIDO]{"name":"Ana","setor":"beleza"}[/PERFIL_EXTRAIDO]'
        result = _extract_profile(text)
        assert result == {"name": "Ana", "setor": "beleza"}

    def test_ignora_nulls(self):
        text = '[PERFIL_EXTRAIDO]{"name":"Ana","setor":null}[/PERFIL_EXTRAIDO]'
        result = _extract_profile(text)
        assert result == {"name": "Ana"}

    def test_sem_tag(self):
        assert _extract_profile("Ola, como posso ajudar?") is None

    def test_json_invalido(self):
        text = "[PERFIL_EXTRAIDO]{invalido}[/PERFIL_EXTRAIDO]"
        assert _extract_profile(text) is None


# --- _extract_profile_update ---

class TestExtractProfileUpdate:
    def test_extrai_atualizacao(self):
        text = 'Parabens! [PERFIL_ATUALIZADO]{"faturamento":"R$ 20.000/mes","faturamento_mensal":20000}[/PERFIL_ATUALIZADO]'
        result = _extract_profile_update(text)
        assert result["faturamento"] == "R$ 20.000/mes"
        assert result["faturamento_mensal"] == 20000

    def test_sem_tag(self):
        assert _extract_profile_update("Boa pergunta!") is None
