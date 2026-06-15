from user_management.utils.jwt import create_access_token, decode_access_token


class TestJWT:
    def test_create_and_decode_access_token(self):
        token = create_access_token(user_id=42, role="user")
        payload = decode_access_token(token)

        assert payload is not None
        assert payload["sub"] == "42"
        assert payload["role"] == "user"
        assert "exp" in payload

    def test_decode_invalid_token_returns_none(self):
        assert decode_access_token("not.a.valid.token") is None

    def test_decode_tampered_token_returns_none(self):
        token = create_access_token(user_id=1, role="user")
        tampered = token[:-4] + "xxxx"
        assert decode_access_token(tampered) is None
