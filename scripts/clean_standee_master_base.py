import numpy as np
from PIL import Image

def clean_master_template():
    src_path = 'public/standees/standee_master_authentic.jpg'
    im = Image.open(src_path).convert('RGB')
    arr = np.array(im)

    # Clean the top navy arch
    y1, y2 = 6, 157
    x1, x2 = 160, 565
    w = x2 - x1
    h = y2 - y1

    # Vertical gradient matching the authentic luxury navy arch
    patch = np.zeros((h, w, 3), dtype=np.float32)
    for y in range(h):
        factor = y / float(h - 1)
        r = 6.0 * (1.0 - factor) + 2.0 * factor
        g = 25.0 * (1.0 - factor) + 10.0 * factor
        b = 50.0 * (1.0 - factor) + 24.0 * factor
        patch[y, :] = [r, g, b]

    # Smooth horizontal cosine fade (30 pixels) on left and right
    fade = 30
    mask = np.ones((h, w), dtype=np.float32)
    for i in range(fade):
        factor = 0.5 * (1.0 - np.cos(np.pi * i / float(fade)))
        mask[:, i] *= factor
        mask[:, w - 1 - i] *= factor

    # Top fade (4 pixels) to blend with top gold edge smoothly
    for j in range(4):
        factor = 0.5 * (1.0 - np.cos(np.pi * (j + 1) / 4.0))
        mask[j, :] *= factor

    for c in range(3):
        arr[y1:y2, x1:x2, c] = arr[y1:y2, x1:x2, c] * (1.0 - mask) + patch[:, :, c] * mask

    cleaned = Image.fromarray(arr)
    cleaned.save('public/standees/standee_master_authentic.jpg', quality=95, optimize=True)
    print('Updated public/standees/standee_master_authentic.jpg')

    # Also save a crop of the arch to scratch for visual audit
    crop = cleaned.crop((0, 0, 723, 200))
    crop.save('scratch/audited_clean_master_arch.png')
    print('Saved scratch/audited_clean_master_arch.png')

clean_master_template()
