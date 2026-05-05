import re


class Security:
    USUARIO_PATTERN = re.compile(
        r'^(?:[A-Z]{4}[0-9]{6}[A-Z]{3}[A-Z0-9]{3}[A-Z]{2}[0-9]|[A-Z0-9]{5,20})$'
    )
    PASSWORD_PATTERN = re.compile(r'^.{8,20}$')

    @staticmethod
    def validar_usuario(usuario: str) -> bool:
        """Valida que el usuario tenga entre 5 y 20 caracteres alfanuméricos."""
        if not isinstance(usuario, str):
            return False

        return bool(Security.USUARIO_PATTERN.fullmatch(usuario))

    @staticmethod
    def validar_contrasena(contrasena: str) -> bool:
        """Valida que la contraseña tenga entre 8 y 20 caracteres."""
        if not isinstance(contrasena, str):
            return False

        return bool(Security.PASSWORD_PATTERN.fullmatch(contrasena))
