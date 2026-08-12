from database import engine

try:
    conexion = engine.connect()
    print("Conexión exitosa a la base de datos")
    conexion.close()
except Exception as e:
    print("Error de conexión:", e)
    