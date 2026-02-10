def test_user_login_e2e():
    browser.open("[https://myapp.com"](https://myapp.com"))
    browser.fill("username", "testuser")
    browser.fill("password", "pass123")
    browser.click("login_button")
    assert browser.sees("Welcome, testuser!")