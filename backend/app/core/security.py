import re


class Security:
    USUARIO_PATTERN = re.compile(r'^[A-Z]{4}\d{6}[A-Z][A-Z]{2}[A-Z0-9]{4}[A-Z]{2}\d$')
    PASSWORD_PATTERN = re.compile(r'^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[@#$%&!?])[A-Za-z\d@#$%&!?]{8}$')

    @staticmethod
    def validar_usuario(usuario: str) -> bool:
        """Valida que el usuario cumpla el formato de 20 caracteres, solo mayúsculas y dígitos."""
        if not isinstance(usuario, str):
            return False

        if len(usuario) != 20:
            return False

        return bool(Security.USUARIO_PATTERN.fullmatch(usuario))

    @staticmethod
    def validar_contrasena(contrasena: str) -> bool:
        """Valida que la contraseña tenga 8 caracteres con mayúscula, minúscula, número y carácter especial."""
        if not isinstance(contrasena, str):
            return False

        return bool(Security.PASSWORD_PATTERN.fullmatch(contrasena))
