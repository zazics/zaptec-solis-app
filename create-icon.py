#!/usr/bin/env python3
"""
Script pour créer une icône d'application personnalisée pour ZaptecSolis
Combine des éléments solaires et de recharge électrique
"""

try:
    from PIL import Image, ImageDraw, ImageFont
    import os
except ImportError:
    print("PIL (Pillow) n'est pas installé. Installez-le avec: pip install Pillow")
    exit(1)

def create_icon():
    # Taille de base (1024x1024 pour iOS, sera redimensionnée pour Android)
    size = 1024
    
    # Créer l'image de base avec un fond dégradé
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    # Couleurs inspirées du solaire et de l'électrique
    sun_color = (255, 193, 7)  # Orange/jaune solaire
    electric_color = (33, 150, 243)  # Bleu électrique
    charging_color = (76, 175, 80)  # Vert pour la charge
    
    # Fond circulaire avec dégradé
    center = size // 2
    radius = int(size * 0.45)
    
    # Dessiner un cercle de fond
    draw.ellipse([center - radius, center - radius, center + radius, center + radius], 
                 fill=(240, 248, 255), outline=None)  # Bleu très clair
    
    # Dessiner le soleil (partie gauche/haut)
    sun_radius = int(radius * 0.4)
    sun_center_x = center - int(radius * 0.2)
    sun_center_y = center - int(radius * 0.2)
    
    # Rayons du soleil
    ray_length = int(sun_radius * 0.7)
    for angle in range(0, 360, 45):
        import math
        rad = math.radians(angle)
        x1 = sun_center_x + int((sun_radius - 10) * math.cos(rad))
        y1 = sun_center_y + int((sun_radius - 10) * math.sin(rad))
        x2 = sun_center_x + int((sun_radius + ray_length) * math.cos(rad))
        y2 = sun_center_y + int((sun_radius + ray_length) * math.sin(rad))
        draw.line([x1, y1, x2, y2], fill=sun_color, width=8)
    
    # Corps du soleil
    draw.ellipse([sun_center_x - sun_radius, sun_center_y - sun_radius, 
                  sun_center_x + sun_radius, sun_center_y + sun_radius], 
                 fill=sun_color)
    
    # Dessiner la prise électrique/voiture (partie droite/bas)
    car_width = int(radius * 0.6)
    car_height = int(radius * 0.4)
    car_x = center + int(radius * 0.1) - car_width // 2
    car_y = center + int(radius * 0.2) - car_height // 2
    
    # Corps de la "voiture" stylisée (rectangle arrondi)
    draw.rounded_rectangle([car_x, car_y, car_x + car_width, car_y + car_height],
                          radius=20, fill=electric_color)
    
    # Câble de charge (courbe)
    cable_points = []
    import math
    for i in range(20):
        t = i / 19.0
        x = int(sun_center_x + sun_radius * 0.7 + t * (car_x - sun_center_x - sun_radius * 0.7))
        y = int(sun_center_y + sun_radius * 0.7 + math.sin(t * math.pi) * 30)
        cable_points.append((x, y))
    
    for i in range(len(cable_points) - 1):
        draw.line([cable_points[i], cable_points[i + 1]], fill=charging_color, width=12)
    
    # Prise de charge (petit rectangle sur la voiture)
    plug_size = 15
    plug_x = car_x - plug_size
    plug_y = car_y + car_height // 2 - plug_size // 2
    draw.rectangle([plug_x, plug_y, plug_x + plug_size, plug_y + plug_size], 
                   fill=charging_color)
    
    # Éclair dans le soleil pour symboliser l'énergie
    lightning_points = [
        (sun_center_x - 15, sun_center_y - 30),
        (sun_center_x + 5, sun_center_y - 10),
        (sun_center_x - 5, sun_center_y - 5),
        (sun_center_x + 15, sun_center_y + 25),
        (sun_center_x + 0, sun_center_y + 10),
        (sun_center_x + 10, sun_center_y + 5)
    ]
    draw.polygon(lightning_points, fill=(255, 255, 255))
    
    return img

def resize_for_android(base_img):
    """Créer les différentes tailles pour Android"""
    sizes = {
        'mdpi': 48,
        'hdpi': 72,
        'xhdpi': 96,
        'xxhdpi': 144,
        'xxxhdpi': 192
    }
    
    android_icons = {}
    for density, size in sizes.items():
        resized = base_img.resize((size, size), Image.Resampling.LANCZOS)
        android_icons[density] = resized
    
    return android_icons

def main():
    print("Création de l'icône ZaptecSolis...")
    
    # Créer l'icône de base
    icon = create_icon()
    
    # Sauvegarder l'icône principale (1024x1024)
    icon.save('C:\\develop\\solaar\\ZaptecSolisApp\\assets\\icon.png', 'PNG')
    print("OK Icone principale sauvegardee (1024x1024)")
    
    # Créer l'icône adaptative Android (512x512)
    adaptive_icon = icon.resize((512, 512), Image.Resampling.LANCZOS)
    adaptive_icon.save('C:\\develop\\solaar\\ZaptecSolisApp\\assets\\adaptive-icon.png', 'PNG')
    print("OK Icone adaptative sauvegardee (512x512)")
    
    # Créer l'icône de splash
    splash_icon = icon.resize((200, 200), Image.Resampling.LANCZOS)
    splash_icon.save('C:\\develop\\solaar\\ZaptecSolisApp\\assets\\splash-icon.png', 'PNG')
    print("OK Icone de splash sauvegardee (200x200)")
    
    # Créer le favicon
    favicon = icon.resize((32, 32), Image.Resampling.LANCZOS)
    favicon.save('C:\\develop\\solaar\\ZaptecSolisApp\\assets\\favicon.png', 'PNG')
    print("OK Favicon sauvegarde (32x32)")
    
    print("\nToutes les icones ont ete creees avec succes !")
    print("L'icône combine :")
    print("- Un soleil doré avec des rayons (énergie solaire)")
    print("- Une voiture électrique stylisée en bleu")
    print("- Un câble de charge vert reliant les deux")
    print("- Un éclair blanc dans le soleil (énergie)")
    
if __name__ == "__main__":
    main()