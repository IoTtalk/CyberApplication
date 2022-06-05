import datetime
import accountClient as api_client
import jwt

from django.conf import settings


def get_access_token():
    if not settings.ACCOUNT_HOST:
        return ''

    if not settings.ACCOUNT_API_TOKEN:
        return ''

    if not settings.ACCOUNT_CLIENT_ID:
        return ''

    if not settings.ACCOUNT_CLIENT_SECRET:
        return ''

    if not settings.ACCOUNT_OAUTH2_REDIRECT_URI:
        return ''

    api_client.set_host(settings.ACCOUNT_HOST)
    code = api_client.oauth2_authorize(
        settings.ACCOUNT_API_TOKEN,
        settings.ACCOUNT_OIDC_AUTHORIZATION_ENDPOINT,
        settings.ACCOUNT_CLIENT_ID,
        settings.ACCOUNT_OAUTH2_REDIRECT_URI)

    token_response = api_client.oauth2_token_request(
        settings.ACCOUNT_OIDC_AUTHORIZATION_ENDPOINT,
        settings.ACCOUNT_CLIENT_ID,
        settings.ACCOUNT_CLIENT_SECRET,
        code,
        settings.ACCOUNT_OAUTH2_REDIRECT_URI)

    access_token = token_response['access_token']
    # print(f'access_token: {access_token}')
    return access_token
    # user_info = jwt.decode(token_response['id_token'], options={'verify_signature': False})
    # print('user_info:', user_info)
