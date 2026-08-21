using BCrypt.Net;

namespace DistribuidoraAPI.Services.Security;

/// <summary>
/// Servicio para el hash y verificación segura de contraseñas
/// Utiliza BCrypt.Net para garantizar seguridad criptográfica
/// </summary>
public interface IPasswordHasher
{
    /// <summary>
    /// Genera un hash seguro para una contraseña
    /// </summary>
    /// <param name="password">Contraseña en texto plano</param>
    /// <returns>Hash seguro de la contraseña</returns>
    string HashPassword(string password);

    /// <summary>
    /// Verifica si una contraseña coincide con su hash
    /// </summary>
    /// <param name="password">Contraseña en texto plano a verificar</param>
    /// <param name="hash">Hash almacenado para comparación</param>
    /// <returns>True si la contraseña es correcta, false en caso contrario</returns>
    bool VerifyPassword(string password, string hash);
}

/// <summary>
/// Implementación del servicio de hashing usando BCrypt
/// </summary>
public class PasswordHasher : IPasswordHasher
{
    /// <summary>
    /// Genera un hash seguro para una contraseña usando BCrypt con 12 rounds
    /// </summary>
    public string HashPassword(string password)
    {
        if (string.IsNullOrWhiteSpace(password))
            throw new ArgumentException("La contraseña no puede estar vacía");

        // BCrypt con 12 rounds proporciona un balance entre seguridad y rendimiento
        return BCrypt.Net.BCrypt.HashPassword(password, 12);
    }

    /// <summary>
    /// Verifica si una contraseña coincide con su hash BCrypt
    /// </summary>
    public bool VerifyPassword(string password, string hash)
    {
        if (string.IsNullOrWhiteSpace(password) || string.IsNullOrWhiteSpace(hash))
            return false;

        try
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }
        catch (SaltParseException)
        {
            // Hash inválido o corrupto
            return false;
        }
    }
}
