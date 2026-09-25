#!/usr/bin/env python3
"""
Com Deus Kids — Extrator Sob Demanda de Assets
Extrai APENAS o asset necessário de um ZIP da pasta design-reference/games-assets
para apps/games/public/assets/<destino>, evitando duplicação indiscriminada ou bundle gigante.
"""

import sys
import os
import json
import zipfile
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
ASSETS_DIR = BASE_DIR / "design-reference" / "games-assets"
CATALOG_PATH = BASE_DIR / "packages" / "game-core" / "src" / "assets" / "catalog.json"

def extract_asset(asset_id: str, dest_dir: str = "apps/games/public/assets") -> str:
    if not CATALOG_PATH.exists():
        print(f"❌ Catálogo não encontrado em {CATALOG_PATH}. Execute catalog-assets.py primeiro.")
        return ""

    with open(CATALOG_PATH, 'r', encoding='utf-8') as f:
        data = json.load(f)

    target_asset = None
    for a in data.get('assets', []):
        if a['id'] == asset_id:
            target_asset = a
            break

    if not target_asset:
        print(f"❌ Asset ID '{asset_id}' não encontrado no catálogo.")
        return ""

    destination_path = BASE_DIR / dest_dir / target_asset['name']
    destination_path.parent.mkdir(parents=True, exist_ok=True)

    if not target_asset['isInZip']:
        # Copiar arquivo solto
        source_path = ASSETS_DIR / target_asset['sourcePath']
        with open(source_path, 'rb') as src, open(destination_path, 'wb') as dst:
            dst.write(src.read())
        print(f"✅ Asset copiado com sucesso para: {destination_path}")
        return str(destination_path)
    else:
        # Extrair de dentro do ZIP
        zip_path = ASSETS_DIR / target_asset['zipArchive']
        with zipfile.ZipFile(zip_path, 'r') as zf:
            with zf.open(target_asset['sourcePath']) as src, open(destination_path, 'wb') as dst:
                dst.write(src.read())
        print(f"✅ Asset extraído de {target_asset['zipArchive']} para: {destination_path}")
        return str(destination_path)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print("Uso: python3 extract-asset.py <asset_id> [destino_relativo]")
        sys.exit(1)
    asset_id = sys.argv[1]
    dest = sys.argv[2] if len(sys.argv) > 2 else "apps/games/public/assets/extracted"
    extract_asset(asset_id, dest)
