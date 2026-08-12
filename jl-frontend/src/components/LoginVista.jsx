import { Link } from 'react-router-dom'

function LoginVista({ correo, contrasena, error, onCorreoChange, onContrasenaChange, onSubmit }) {
  return (
    <div>
      <Link to="/">← Volver al catálogo</Link>
      <h1>Iniciar Sesión</h1>

      <form onSubmit={onSubmit}>
        <div>
          <label>Correo:</label>
          <input
            type="email"
            value={correo}
            onChange={e => onCorreoChange(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Contraseña:</label>
          <input
            type="password"
            value={contrasena}
            onChange={e => onContrasenaChange(e.target.value)}
            required
          />
        </div>

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <button type="submit">Entrar</button>
      </form>
    </div>
  )
}

export default LoginVista