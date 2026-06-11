import pg8000
import datetime

def main():
    try:
        conn = pg8000.dbapi.connect(
            user="postgres",
            password="Aforo255#2019",
            host="localhost",
            port=5434,
            database="db_security"
        )
        cursor = conn.cursor()
        
        # 1. Insert permission if it doesn't exist
        name = 'Produccion'
        desc = 'Gestión de Recetas y Producción'
        
        cursor.execute('SELECT "ID_Permiso" FROM "Permiso" WHERE "Nombre_Permiso" = %s', (name,))
        res = cursor.fetchone()
        if res:
            perm_id = res[0]
            print(f"Permission '{name}' already exists with ID {perm_id}")
        else:
            cursor.execute(
                'INSERT INTO "Permiso" ("Nombre_Permiso", "Descripcion", "Fecha_Creacion") VALUES (%s, %s, %s) RETURNING "ID_Permiso"',
                (name, desc, datetime.datetime.now())
            )
            perm_id = cursor.fetchone()[0]
            print(f"Inserted permission '{name}' with ID {perm_id}")
        
        # 2. Check Admin role (ID = 1 or by name)
        cursor.execute('SELECT "ID_Rol" FROM "Rol" WHERE "Nombre_Rol" = %s', ('Admin',))
        admin_role = cursor.fetchone()
        if not admin_role:
            print("Admin role not found!")
            return
        admin_role_id = admin_role[0]
        print(f"Admin Role ID: {admin_role_id}")
        
        # 3. Associate permission with Admin role in Rol_Permiso
        cursor.execute(
            'SELECT "ID_Rol_Permiso" FROM "Rol_Permiso" WHERE "ID_Rol" = %s AND "ID_Permiso" = %s',
            (admin_role_id, perm_id)
        )
        res_rp = cursor.fetchone()
        if res_rp:
            rp_id = res_rp[0]
            print(f"Relation Admin -> '{name}' already exists in Rol_Permiso with ID {rp_id}")
        else:
            cursor.execute(
                'INSERT INTO "Rol_Permiso" ("ID_Rol", "ID_Permiso") VALUES (%s, %s) RETURNING "ID_Rol_Permiso"',
                (admin_role_id, perm_id)
            )
            rp_id = cursor.fetchone()[0]
            print(f"Inserted relation Admin -> '{name}' in Rol_Permiso with ID {rp_id}")
            
        # 4. Check Admin user
        cursor.execute('SELECT "UserId" FROM "Usuario" WHERE "Username" = %s', ('admin',))
        admin_user = cursor.fetchone()
        if not admin_user:
            print("Admin user not found!")
            return
        admin_user_id = admin_user[0]
        print(f"Admin User ID: {admin_user_id}")
        
        # 5. Associate Rol_Permiso with Admin user in Rol_Permiso_Usuario
        cursor.execute(
            'SELECT "ID_Usuario_Rol_Permiso" FROM "Rol_Permiso_Usuario" WHERE "UserId" = %s AND "ID_Rol_Permiso" = %s',
            (admin_user_id, rp_id)
        )
        res_rpu = cursor.fetchone()
        if res_rpu:
            print(f"Relation User {admin_user_id} -> Rol_Permiso {rp_id} already exists in Rol_Permiso_Usuario with ID {res_rpu[0]}")
        else:
            cursor.execute(
                'INSERT INTO "Rol_Permiso_Usuario" ("UserId", "ID_Rol_Permiso") VALUES (%s, %s) RETURNING "ID_Usuario_Rol_Permiso"',
                (admin_user_id, rp_id)
            )
            print(f"Inserted relation User {admin_user_id} -> Rol_Permiso {rp_id} in Rol_Permiso_Usuario with ID {cursor.fetchone()[0]}")
            
        conn.commit()
        print("Permissions successfully updated!")
        conn.close()
    except Exception as e:
        print("Error during update:", e)

if __name__ == "__main__":
    main()
