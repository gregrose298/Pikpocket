#!/usr/bin/env python3
"""
Génère les icônes PWA 192x192 et 512x512 pour MonBudget
Utilise uniquement la bibliothèque standard (pas de Pillow nécessaire)
"""

import struct
import zlib
import math
import os

def create_png(size, bg_color, emoji_placeholder=True):
    """Crée un PNG simple avec dégradé bleu et emoji 💎"""
    
    def encode_png(width, height, pixels_rgba):
        def write_chunk(chunk_type, data):
            chunk_len = len(data)
            chunk_data = chunk_type + data
            crc = zlib.crc32(chunk_data) & 0xffffffff
            return struct.pack('>I', chunk_len) + chunk_data + struct.pack('>I', crc)
        
        # PNG signature
        signature = b'\x89PNG\r\n\x1a\n'
        
        # IHDR chunk
        ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
        ihdr = write_chunk(b'IHDR', ihdr_data)
        
        # IDAT chunk (image data)
        raw_data = b''
        for y in range(height):
            raw_data += b'\x00'  # filter type none
            for x in range(width):
                raw_data += bytes(pixels_rgba[y][x][:3])
        
        compressed = zlib.compress(raw_data, 9)
        idat = write_chunk(b'IDAT', compressed)
        
        # IEND chunk
        iend = write_chunk(b'IEND', b'')
        
        return signature + ihdr + idat + iend
    
    pixels = []
    cx, cy = size // 2, size // 2
    r = size // 2
    
    for y in range(size):
        row = []
        for x in range(size):
            # Distance from center
            dx, dy = x - cx, y - cy
            dist = math.sqrt(dx*dx + dy*dy)
            
            # Rounded square mask
            corner_r = size * 0.22
            in_shape = True
            
            # Check corners for rounded rectangle
            for cx2, cy2 in [(corner_r, corner_r), (size-corner_r, corner_r), 
                             (corner_r, size-corner_r), (size-corner_r, size-corner_r)]:
                if x < corner_r and y < corner_r:
                    in_shape = math.sqrt((x-corner_r)**2 + (y-corner_r)**2) <= corner_r
                elif x > size-corner_r and y < corner_r:
                    in_shape = math.sqrt((x-(size-corner_r))**2 + (y-corner_r)**2) <= corner_r
                elif x < corner_r and y > size-corner_r:
                    in_shape = math.sqrt((x-corner_r)**2 + (y-(size-corner_r))**2) <= corner_r
                elif x > size-corner_r and y > size-corner_r:
                    in_shape = math.sqrt((x-(size-corner_r))**2 + (y-(size-corner_r))**2) <= corner_r
            
            if not in_shape:
                row.append((248, 249, 251, 0))  # transparent
            else:
                # Gradient: dark blue top-left → cyan bottom-right
                t = (x + y) / (size * 2)
                r_val = int(30 + t * (8 - 30))     # 30 → 8
                g_val = int(64 + t * (145 - 64))    # 64 → 145
                b_val = int(175 + t * (178 - 175))  # 175 → 178
                
                r_val = max(0, min(255, r_val))
                g_val = max(0, min(255, g_val))
                b_val = max(0, min(255, b_val))
                
                # Diamond shape in center (💎 représentation)
                diamond_size = size * 0.25
                rel_x = (x - cx) / diamond_size
                rel_y = (y - cy) / diamond_size
                
                in_diamond = abs(rel_x) + abs(rel_y) < 1.0
                
                if in_diamond:
                    # White/light diamond
                    alpha = 1.0 - (abs(rel_x) + abs(rel_y))
                    r_val = int(r_val + (255 - r_val) * alpha * 0.8)
                    g_val = int(g_val + (255 - g_val) * alpha * 0.8)
                    b_val = int(b_val + (255 - b_val) * alpha * 0.8)
                
                row.append((r_val, g_val, b_val, 255))
        
        pixels.append(row)
    
    return encode_png(size, size, pixels)


# Create output directory
os.makedirs("public/icons", exist_ok=True)

# Generate icons
for size in [192, 512]:
    png_data = create_png(size)
    filename = f"public/icons/icon-{size}.png"
    with open(filename, 'wb') as f:
        f.write(png_data)
    print(f"✓ Icône générée : {filename} ({len(png_data)} bytes)")

print("\n✅ Icônes PWA créées avec succès !")
print("   → public/icons/icon-192.png")
print("   → public/icons/icon-512.png")
