#!/usr/bin/env python3
"""
Com Deus Kids — Scanner e Catalogo Inteligente de Assets de Jogos
Varre recursivamente design-reference/games-assets (incluindo arquivos soltos e dentro de ZIPs)
e gera o catálogo técnico indexado com classificação semântica, estilos visuais, tags e compatibilidade bíblica.
"""

import os
import re
import json
import zipfile
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
ASSETS_DIR = BASE_DIR / "design-reference" / "games-assets"
OUTPUT_CATALOG = BASE_DIR / "packages" / "game-core" / "src" / "assets" / "catalog.json"
OUTPUT_SUMMARY = BASE_DIR / "packages" / "game-core" / "src" / "assets" / "summary.json"

IMAGE_EXTS = {'.png', '.webp', '.jpg', '.jpeg', '.svg'}
MODEL_EXTS = {'.glb', '.gltf', '.fbx', '.obj', '.dae'}
AUDIO_EXTS = {'.wav', '.ogg', '.mp3', '.flac'}
DOC_EXTS = {'license', 'license.txt', 'readme', 'readme.txt', 'credits', 'credits.txt'}

# Mapeamento semântico de tags e tipos
KEYWORD_TAGS = {
    'sheep': ['sheep', 'ovelha', 'lamb', 'cordeiro', 'ram'],
    'lion': ['lion', 'leao', 'leaozinho'],
    'camel': ['camel', 'camelo'],
    'dog': ['dog', 'cachorro', 'hound'],
    'cat': ['cat', 'gato'],
    'pig': ['pig', 'porco'],
    'duck': ['duck', 'pato'],
    'bee': ['bee', 'abelha'],
    'fox': ['fox', 'raposa'],
    'rat': ['rat', 'mouse', 'rato'],
    'coyote': ['coyote', 'coiote'],
    'deer': ['deer', 'servo', 'cervo'],
    'tiger': ['tiger', 'tigre'],
    'shark': ['shark', 'tubarao'],
    'bear': ['bear', 'urso'],
    'horse': ['horse', 'cavalo'],
    'cow': ['cow', 'vaca'],
    'jesus': ['jesus', 'cristo'],
    'knight': ['knight', 'cavaleiro', 'soldier', 'soldado'],
    'shepherd': ['shepherd', 'pastor'],
    'villager': ['villager', 'peasant', 'citizen', 'morador', 'arabe', 'uncle'],
    'archer': ['archer', 'arqueiro', 'gandalf'],
    'adventurer': ['adventurer', 'adventurers', 'hero'],
    'king': ['king', 'rei', 'principe', 'prince'],
    'tree': ['tree', 'arvore', 'trunk', 'wood', 'floresta', 'forest'],
    'bush': ['bush', 'arbusto', 'plant', 'planta'],
    'palm': ['palm', 'palmeira'],
    'grass': ['grass', 'grama'],
    'flower': ['flower', 'flor'],
    'stone': ['stone', 'pedra', 'rock', 'rocha', 'boulder'],
    'mountain': ['mountain', 'montanha', 'cliff'],
    'water': ['water', 'agua', 'river', 'rio', 'sea', 'ocean', 'mar', 'lake'],
    'house': ['house', 'casa', 'building', 'construcao', 'hut', 'cabana'],
    'castle': ['castle', 'castelo', 'tower', 'torre', 'ruins', 'ruinas'],
    'dungeon': ['dungeon', 'calabouco', 'crypt', 'catacomb'],
    'market': ['market', 'mercado', 'stall', 'barraca', 'pot', 'jar', 'crate'],
    'bridge': ['bridge', 'ponte'],
    'fence': ['fence', 'cerca'],
    'door': ['door', 'porta', 'gate', 'portao'],
    'coin': ['coin', 'moeda', 'gold', 'ouro'],
    'heart': ['heart', 'coracao', 'life', 'vida'],
    'star': ['star', 'estrela'],
    'gem': ['gem', 'gema', 'diamond', 'jewel', 'ruby'],
    'chest': ['chest', 'bau', 'crate', 'caixa', 'barrel', 'barril'],
    'key': ['key', 'chave'],
    'trophy': ['trophy', 'trofeu', 'cup'],
    'button': ['button', 'botao', 'btn', 'ui', 'hud', 'panel', 'banner', 'slider'],
    'desert': ['desert', 'deserto', 'sand', 'areia'],
    'biblical-compatible': ['jesus', 'sheep', 'lion', 'camel', 'shepherd', 'arabe', 'desert', 'village', 'ancient', 'market', 'stone', 'palm', 'cave', 'rock']
}

def detect_visual_style(path_str: str, filename: str) -> str:
    path_lower = (path_str + "/" + filename).lower()
    if any(ext in path_lower for ext in MODEL_EXTS):
        if 'lowpoly' in path_lower or 'kaykit' in path_lower or 'hex' in path_lower:
            return '3d-lowpoly'
        return '3d-stylized'
    if 'pixel' in path_lower or '1-bit' in path_lower or 'tiny swords' in path_lower:
        return 'pixel-art'
    if 'scribble' in path_lower:
        return 'hand-drawn'
    if 'abstract' in path_lower:
        return 'vector-flat'
    if 'kenney' in path_lower:
        return 'cartoon-2d'
    if 'painted' in path_lower:
        return 'painted'
    return 'cartoon-2d'

def detect_type(path_str: str, filename: str) -> tuple[str, str]:
    lower = (path_str + "/" + filename).lower()
    ext = os.path.splitext(filename)[1].lower()

    if ext in MODEL_EXTS:
        return '3d-model', 'mesh'
    if ext in AUDIO_EXTS:
        return 'audio', 'sfx' if 'sfx' in lower else 'music'

    if any(k in lower for k in ['sheep', 'lion', 'dog', 'cat', 'pig', 'duck', 'bee', 'fox', 'rat', 'coyote', 'deer', 'tiger', 'shark', 'animal', 'bear', 'cow', 'horse']):
        return 'animal', 'sprite'
    if any(k in lower for k in ['character', 'knight', 'player', 'hero', 'archer', 'villager', 'arabe', 'jesus', 'uncle', 'principe', 'adventurer', 'zombie', 'soldier']):
        return 'character', 'sprite'
    if any(k in lower for k in ['house', 'building', 'castle', 'tower', 'ruins', 'hut', 'wall', 'door', 'gate']):
        return 'building', 'structure'
    if any(k in lower for k in ['tree', 'bush', 'palm', 'grass', 'flower', 'leaf', 'nature', 'foliage']):
        return 'vegetation', 'nature'
    if any(k in lower for k in ['tile', 'tileset', 'ground', 'dirt', 'road', 'path', 'brick', 'platform']):
        return 'tile', 'tileset'
    if any(k in lower for k in ['background', 'bg', 'sky', 'clouds', 'hills']):
        return 'background', 'scenery'
    if any(k in lower for k in ['coin', 'gem', 'heart', 'star', 'key', 'chest', 'item', 'trophy', 'pickup']):
        return 'collectible', 'item'
    if any(k in lower for k in ['button', 'btn', 'ui', 'hud', 'icon', 'panel', 'banner', 'cursor', 'crosshair']):
        return 'ui', 'hud'
    if any(k in lower for k in ['effect', 'particle', 'smoke', 'dust', 'sparkle', 'explosion', 'fire']):
        return 'effect', 'particle'
    if any(k in lower for k in ['crate', 'barrel', 'pot', 'jar', 'vase', 'torch', 'sign', 'table', 'chair']):
        return 'prop', 'object'

    return 'environment', 'prop'

def extract_tags(path_str: str, filename: str) -> list[str]:
    lower = (path_str + " " + filename).lower()
    tags = set()
    for tag, keywords in KEYWORD_TAGS.items():
        if any(kw in lower for kw in keywords):
            tags.add(tag)

    # Adicionar tags de compatibilidade bíblica
    if any(t in tags for t in ['sheep', 'lion', 'camel', 'jesus', 'shepherd', 'desert', 'palm', 'stone', 'market', 'house']):
        tags.add('biblical-compatible')

    return sorted(list(tags))

def detect_license(pack_name: str, file_list: list[str]) -> tuple[str, bool]:
    lower_pack = pack_name.lower()
    if 'kenney' in lower_pack:
        return 'CC0 1.0 Universal (Public Domain - Free for Commercial Use)', False
    if 'kaykit' in lower_pack:
        return 'CC0 / Free for Commercial Use (Kay Lousberg)', False
    if 'pixel adventure' in lower_pack or 'tiny swords' in lower_pack:
        return 'Free / Itch.io Game Asset License (Free for Commercial and Non-Commercial)', False

    for f in file_list:
        if any(doc in f.lower() for doc in ['license', 'license.txt', 'readme.txt', 'readme.md']):
            return 'Included in Pack (See License File)', True

    return 'Free Game Asset / License on Pack', False

def main():
    print(f"🔍 Escaneando diretório: {ASSETS_DIR}")
    if not ASSETS_DIR.exists():
        print(f"❌ Diretório não encontrado: {ASSETS_DIR}")
        return

    assets = []
    packs_summary = {}
    type_counts = {}
    visual_styles = set()
    biblical_candidates = []

    # 1. Arquivos soltos
    for item in sorted(os.listdir(ASSETS_DIR)):
        item_path = ASSETS_DIR / item
        if item.startswith('.'):
            continue

        if item_path.is_file():
            ext = item_path.suffix.lower()
            if ext in IMAGE_EXTS or ext in MODEL_EXTS or ext in AUDIO_EXTS:
                asset_type, subtype = detect_type("", item)
                v_style = detect_visual_style("", item)
                tags = extract_tags("", item)
                license_str, attr = detect_license("standalone", [])

                asset_id = f"standalone_{re.sub(r'[^a-zA-Z0-9_]', '_', item)}"
                asset = {
                    "id": asset_id,
                    "name": item,
                    "sourcePack": "standalone",
                    "sourcePath": item,
                    "isInZip": False,
                    "zipArchive": None,
                    "format": ext.replace('.', ''),
                    "type": asset_type,
                    "subtype": subtype,
                    "visualStyle": v_style,
                    "tags": tags,
                    "license": license_str,
                    "attributionRequired": attr,
                    "sizeBytes": item_path.stat().st_size
                }
                assets.append(asset)
                type_counts[asset_type] = type_counts.get(asset_type, 0) + 1
                visual_styles.add(v_style)
                if 'biblical-compatible' in tags:
                    biblical_candidates.append(asset_id)

    # 2. Arquivos ZIP
    zip_files = [f for f in sorted(os.listdir(ASSETS_DIR)) if f.lower().endswith('.zip')]
    print(f"📦 Analisando {len(zip_files)} pacotes ZIP compactados...")

    for z_file in zip_files:
        z_path = ASSETS_DIR / z_file
        pack_name = z_path.stem
        try:
            with zipfile.ZipFile(z_path, 'r') as zf:
                namelist = zf.namelist()
                license_str, attr = detect_license(pack_name, namelist)

                valid_entries = 0
                for entry in namelist:
                    if entry.endswith('/') or '__MACOSX' in entry or entry.startswith('.'):
                        continue
                    ext = os.path.splitext(entry)[1].lower()
                    if ext in IMAGE_EXTS or ext in MODEL_EXTS or ext in AUDIO_EXTS:
                        valid_entries += 1
                        filename = os.path.basename(entry)
                        asset_type, subtype = detect_type(entry, filename)
                        v_style = detect_visual_style(pack_name, entry)
                        tags = extract_tags(pack_name + " " + entry, filename)

                        asset_id = f"{re.sub(r'[^a-zA-Z0-9_]', '_', pack_name)}_{re.sub(r'[^a-zA-Z0-9_]', '_', entry)}"
                        asset = {
                            "id": asset_id,
                            "name": filename,
                            "sourcePack": pack_name,
                            "sourcePath": entry,
                            "isInZip": True,
                            "zipArchive": z_file,
                            "format": ext.replace('.', ''),
                            "type": asset_type,
                            "subtype": subtype,
                            "visualStyle": v_style,
                            "tags": tags,
                            "license": license_str,
                            "attributionRequired": attr
                        }
                        assets.append(asset)
                        type_counts[asset_type] = type_counts.get(asset_type, 0) + 1
                        visual_styles.add(v_style)
                        if 'biblical-compatible' in tags:
                            biblical_candidates.append(asset_id)

                packs_summary[pack_name] = {
                    "zip": z_file,
                    "validAssets": valid_entries,
                    "license": license_str
                }
        except Exception as e:
            print(f"⚠️ Erro ao ler zip {z_file}: {e}")

    # Salvar Catálogo Indexado
    OUTPUT_CATALOG.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_CATALOG, 'w', encoding='utf-8') as f:
        json.dump({
            "version": "1.0.0",
            "totalAssets": len(assets),
            "generatedAt": "2026-09-22T21:40:00Z",
            "typeCounts": type_counts,
            "visualStyles": sorted(list(visual_styles)),
            "assets": assets
        }, f, indent=2, ensure_ascii=False)

    summary_data = {
        "totalAssets": len(assets),
        "totalPacks": len(zip_files),
        "typeCounts": type_counts,
        "visualStyles": sorted(list(visual_styles)),
        "biblicalCandidatesCount": len(biblical_candidates),
        "packs": packs_summary
    }

    with open(OUTPUT_SUMMARY, 'w', encoding='utf-8') as f:
        json.dump(summary_data, f, indent=2, ensure_ascii=False)

    print("\n✅ Catálogo gerado com sucesso!")
    print(f"Total de Assets Mapeados: {len(assets)}")
    print("Contagem por Tipo:")
    for t, c in sorted(type_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"  - {t}: {c}")
    print(f"Estilos Visuais: {', '.join(sorted(list(visual_styles)))}")
    print(f"Candidatos Bíblicos Compatíveis: {len(biblical_candidates)}")
    print(f"Catálogo salvo em: {OUTPUT_CATALOG}")

if __name__ == '__main__':
    main()
