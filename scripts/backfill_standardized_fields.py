"""Backfill: popula tempo_negocio_meses e faturamento_mensal para usuarios existentes.

Uso: python -m scripts.backfill_standardized_fields
Executar da raiz do projeto (~/Mentor_Empreendedor).
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.services.supabase_service import _get_client
from app.services.mentor import _parse_tempo_meses, _parse_faturamento


def main():
    client = _get_client()

    # Busca usuarios com campos texto preenchidos mas inteiros nulos
    result = client.table("users").select("*").eq("is_onboarded", True).execute()
    users = result.data

    updated = 0
    for user in users:
        changes = {}

        if user.get("tempo_negocio") and user.get("tempo_negocio_meses") is None:
            meses = _parse_tempo_meses(user["tempo_negocio"])
            if meses is not None:
                changes["tempo_negocio_meses"] = meses

        if user.get("faturamento") and user.get("faturamento_mensal") is None:
            valor = _parse_faturamento(user["faturamento"])
            if valor is not None:
                changes["faturamento_mensal"] = valor

        if changes:
            client.table("users").update(changes).eq("id", user["id"]).execute()
            print(f"  Updated {user.get('name', user['phone'])}: {changes}")
            updated += 1

    print(f"\nDone. {updated}/{len(users)} users updated.")


if __name__ == "__main__":
    main()
