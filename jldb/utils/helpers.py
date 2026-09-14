import re
import unicodedata

def normalizar_nombre(texto: str) -> str:
    """
    Convierte 'Aceite Champion 20W50' → 'aceite-champion-20w50'
    Quita acentos, pasa a minúsculas, reemplaza espacios por guiones,
    y elimina caracteres especiales.
    """
    # Quitar acentos
    texto = unicodedata.normalize('NFKD', texto)
    texto = ''.join(c for c in texto if not unicodedata.combining(c))
    
    # Pasar a minúsculas
    texto = texto.lower()
    
    # Reemplazar espacios y caracteres especiales por guiones
    texto = re.sub(r'[^a-z0-9]+', '-', texto)
    
    # Quitar guiones al inicio o final
    texto = texto.strip('-')
    
    return texto