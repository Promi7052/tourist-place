from user_management.services import hash_password, verify_password


class TestPasswordHashing:
    def test_hash_password_returns_non_plaintext(self):
        hashed = hash_password("secretpassword")
        assert hashed != "secretpassword"
        assert len(hashed) > 0

    def test_verify_password_accepts_correct_password(self):
        plain = "mysecurepassword"
        hashed = hash_password(plain)
        assert verify_password(plain, hashed) is True

    def test_verify_password_rejects_incorrect_password(self):
        hashed = hash_password("correctpassword")
        assert verify_password("wrongpassword", hashed) is False
