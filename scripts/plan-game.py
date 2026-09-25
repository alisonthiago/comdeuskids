#!/usr/bin/env python3
"""
Com Deus Kids — Planejador Rápido de Assets para Novos Jogos
Verifica a prontidão de assets para um novo título bíblico com base no catálogo indexado.
"""

import sys
import json
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
CATALOG_PATH = BASE_DIR / "packages" / "game-core" / "src" / "assets" / "catalog.json"

SAMPLE_GAMES = {
    "a-ovelha-perdida": {
        "title": "A Ovelha Perdida",
        "genre": "platformer",
        "preferredStyle": "cartoon-2d",
        "requirements": [
            {"key": "player", "type": "character", "tags": ["shepherd", "adventurer", "hero"]},
            {"key": "sheep", "type": "animal", "tags": ["sheep"]},
            {"key": "ground_tiles", "type": "tile", "tags": ["grass", "stone", "platform"]},
            {"key": "trees", "type": "vegetation", "tags": ["tree", "nature"]},
            {"key": "hills_bg", "type": "background", "tags": ["mountain", "sky"]},
            {"key": "house", "type": "building", "tags": ["house", "village"]},
            {"key": "heart_hud", "type": "collectible", "tags": ["heart"]},
            {"key": "star_points", "type": "collectible", "tags": ["star", "coin"]},
            {"key": "pause_btn", "type": "ui", "tags": ["button", "hud"]}
        ]
    },
    "davi-e-golias": {
        "title": "Davi contra Golias",
        "genre": "adventure",
        "preferredStyle": "3d-stylized",
        "requirements": [
            {"key": "davi", "type": "3d-model", "tags": ["adventurer", "hero"]},
            {"key": "leao", "type": "3d-model", "tags": ["lion"]},
            {"key": "pedras", "type": "3d-model", "tags": ["stone", "rock"]},
            {"key": "sheep", "type": "animal", "tags": ["sheep"]},
            {"key": "village", "type": "building", "tags": ["village", "ancient"]}
        ]
    },
    "daniel-na-cova-dos-leoes": {
        "title": "Daniel na Cova dos Leões",
        "genre": "puzzle",
        "preferredStyle": "3d-stylized",
        "requirements": [
            {"key": "daniel", "type": "3d-model", "tags": ["arabe", "villager"]},
            {"key": "leoes", "type": "3d-model", "tags": ["lion"]},
            {"key": "cave_ruins", "type": "building", "tags": ["ruins", "stone", "dungeon"]},
            {"key": "star", "type": "collectible", "tags": ["star"]}
        ]
    }
}

def plan(game_slug: str):
    if not CATALOG_PATH.exists():
        print(f"❌ Catálogo {CATALOG_PATH} não encontrado. Execute catalog-assets.py primeiro.")
        return

    with open(CATALOG_PATH, 'r', encoding='utf-8') as f:
        catalog = json.load(f)

    assets = catalog.get("assets", [])
    game_def = SAMPLE_GAMES.get(game_slug.lower(), SAMPLE_GAMES["a-ovelha-perdida"])

    print(f"\n🎮 PLANEJAMENTO DE ASSETS: {game_def['title'].upper()}")
    print(f"Gênero: {game_def['genre']} | Estilo Preferido: {game_def['preferredStyle']}\n")

    found = []
    missing = []

    for req in game_def["requirements"]:
        best_match = None
        best_score = 0

        for a in assets:
            if a["type"] != req["type"] and not (req["type"] == "platform" and a["type"] == "tile"):
                continue

            score = 30
            # Tag match
            matched = sum(1 for t in req["tags"] if t in a["tags"])
            if req["tags"]:
                score += (matched / len(req["tags"])) * 45

            # Style match
            if a["visualStyle"] == game_def["preferredStyle"]:
                score += 25
            elif a["visualStyle"].startswith("3d") == game_def["preferredStyle"].startswith("3d"):
                score += 10

            if score > best_score:
                best_score = score
                best_match = a

        if best_match and best_score >= 45:
            found.append((req["key"], best_match, int(best_score)))
        else:
            missing.append(req)

    print("✅ ENCONTRADOS NO ACERVO:")
    for key, a, score in found:
        source = f"{a['zipArchive']} -> {a['sourcePath']}" if a['isInZip'] else a['name']
        print(f"  • {key.upper()}: {a['name']} (Pack: {a['sourcePack']}, Estilo: {a['visualStyle']}, Score: {score}%)")
        print(f"    Origem: {source}")

    if missing:
        print("\n⚠️ FALTANDO NO ACERVO:")
        for m in missing:
            print(f"  • {m['key'].upper()} ({m['type']}) com tags: {m['tags']}")
    else:
        print("\n🎉 TODOS OS ASSETS NECESSÁRIOS ESTÃO DISPONÍVEIS NO ACERVO!")

    total = len(game_def["requirements"])
    readiness = int((len(found) / total) * 100) if total > 0 else 0
    print(f"\n📊 Prontidão do Jogo: {readiness}%")

if __name__ == '__main__':
    slug = sys.argv[1] if len(sys.argv) > 1 else "a-ovelha-perdida"
    plan(slug)
