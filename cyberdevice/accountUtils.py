import datetime
import jwt

from django.conf import settings

import cyberdevice.accountClient as api_client

_access_token_cache = None
_access_token_expired = None


def get_access_token():
    global _access_token_cache, _access_token_expired
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

    if _access_token_cache is not None and _access_token_expired is not None and _access_token_expired > datetime.datetime.now():
        return _access_token_cache

    api_client.set_host(settings.ACCOUNT_HOST)
    code = api_client.oauth2_authorize(
        settings.ACCOUNT_API_TOKEN,
        settings.ACCOUNT_OIDC_AUTHORIZATION_ENDPOINT,
        settings.ACCOUNT_CLIENT_ID,
        settings.ACCOUNT_OAUTH2_REDIRECT_URI)

    token_response = api_client.oauth2_token_request(
        settings.ACCOUNT_OIDC_TOKEN_ENDPOINT,
        settings.ACCOUNT_CLIENT_ID,
        settings.ACCOUNT_CLIENT_SECRET,
        code,
        settings.ACCOUNT_OAUTH2_REDIRECT_URI)

    _access_token_cache = token_response['access_token']
    expire_in = token_response['expires_in']
    _access_token_expired = datetime.datetime.now() + datetime.timedelta(seconds=expire_in)

    return _access_token_cache
