"""GTA 6 Heist Calculator — https://www.gta6heistguide.com/free/"""
LEONIDA_VAULTS = {
    "leonida-reserve": {"name": "Leonida State Gold Reserve", "base": 25000000, "cycle_mins": 125},
    "sinfrontera-bank": {"name": "Sinfrontera National Bank", "base": 14500000, "cycle_mins": 99},
    "vice-city-yacht-heist": {"name": "Starlet Superyacht Offshore", "base": 11800000, "cycle_mins": 101},
    "ocean-drive-armored-convoy": {"name": "Ocean Drive Armored Convoy", "base": 9400000, "cycle_mins": 65},
    "port-gellhorn": {"name": "Port Gellhorn Container Terminal", "base": 8200000, "cycle_mins": 80},
    "everglades-smuggler-run": {"name": "Grassrivers Cartel Airstrip", "base": 6500000, "cycle_mins": 68},
}

def calculate_net_per_hour(vault_slug="leonida-reserve", players=2, fee_pct=28, weekly_bonus=False):
    v = LEONIDA_VAULTS.get(vault_slug, LEONIDA_VAULTS["leonida-reserve"])
    gross = v["base"] * (1.5 if weekly_bonus else 1.0) * 1.05
    net_take = (gross * (1 - fee_pct / 100.0)) / max(1, players)
    return {
        "vault": v["name"],
        "per_player_net": round(net_take),
        "net_per_hour": round(net_take / (v["cycle_mins"] / 60.0)),
        "url": "https://www.gta6heistguide.com/free/"
    }
