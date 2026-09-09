"""Generate QMcover's original gold dust texture using only the Python standard library.

Run: python3 scripts/build-vanguard-texture.py
No reference artwork or third-party texture is sampled.
"""
import math
import struct
import zlib
from pathlib import Path

WIDTH, HEIGHT = 512, 192


def hash_noise(x, y):
    n = (x * 374761393 + y * 668265263 + 6179) & 0xffffffff
    n = ((n ^ (n >> 13)) * 1274126177) & 0xffffffff
    return ((n ^ (n >> 16)) & 0xffffffff) / 4294967295


def noise(x, y, scale):
    x, y = x / scale, y / scale
    ix, iy = math.floor(x), math.floor(y)
    u, v = x - ix, y - iy
    u, v = u * u * (3 - 2 * u), v * v * (3 - 2 * v)
    top = hash_noise(ix, iy) * (1 - u) + hash_noise(ix + 1, iy) * u
    bottom = hash_noise(ix, iy + 1) * (1 - u) + hash_noise(ix + 1, iy + 1) * u
    return top * (1 - v) + bottom * v


def chunk(kind, data):
    return struct.pack('!I', len(data)) + kind + data + struct.pack('!I', zlib.crc32(kind + data) & 0xffffffff)


def build():
    # Eight warm tones and 32 alpha levels retain the fine dust in a compact indexed PNG.
    palette, alpha = bytearray(), bytearray()
    for tone in range(8):
        for opacity in range(32):
            palette.extend((round(191 + 42 * tone / 7), round(139 + 42 * tone / 7), round(42 + 37 * tone / 7)))
            alpha.append(round(255 * opacity / 31))
    pixels = bytearray()
    for y in range(HEIGHT):
        pixels.append(0)
        for x in range(WIDTH):
            cloud = (.52 * noise(x * 2, y * 2, 76) + .29 * noise(x * 2 + 430, y * 2 + 920, 27)
                     + .13 * noise(x * 2 + 600, y * 2, 9) + .06 * noise(x * 2, y * 2, 3))
            coverage = max(0, min(1, (cloud - .41) / .25))
            coverage = coverage * coverage * (3 - 2 * coverage)
            grain = hash_noise(x + 1823, y + 671)
            opacity = round(31 * 250 / 255 * coverage * (.2 + .8 * grain ** 1.2))
            tone = round(7 * hash_noise(x + 474, y + 988))
            pixels.append(tone * 32 + opacity)
    png = (b'\x89PNG\r\n\x1a\n'
           + chunk(b'IHDR', struct.pack('!IIBBBBB', WIDTH, HEIGHT, 8, 3, 0, 0, 0))
           + chunk(b'PLTE', palette) + chunk(b'tRNS', alpha)
           + chunk(b'IDAT', zlib.compress(pixels, 9)) + chunk(b'IEND', b''))
    destination = Path(__file__).resolve().parents[1] / 'src/assets/textures/vanguard-gold.png'
    destination.parent.mkdir(parents=True, exist_ok=True)
    destination.write_bytes(png)


if __name__ == '__main__':
    build()
