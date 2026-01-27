import http.client, json, sys

try:
    conn = http.client.HTTPConnection('127.0.0.1', 8000, timeout=5)
    payload = json.dumps({
        'username': 'test_user_restart',
        'email': 'test_user_restart@example.com',
        'password': 'Test123!',
        'role': 'student'
    })
    headers = {'Content-Type': 'application/json'}
    conn.request('POST', '/api/auth/register/', payload, headers)
    res = conn.getresponse()
    print(res.status)
    print(res.read().decode())
except Exception as e:
    print('ERROR:', e)
    sys.exit(1)
