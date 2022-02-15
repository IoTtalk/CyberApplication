import os

from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render
from django.views import View

# load da list
def get_da_list():
    dirs = os.listdir(os.path.join('', 'cyberdevice/templates/da'))
    return [da.replace('.html', '') for da in dirs if '.html' in da]

# load vp list
def get_vp_list():
    return os.listdir(os.path.join('', 'cyberdevice/static/vp'))

da_list = get_da_list()
vp_list = get_vp_list()
print('da_list', da_list)
print('vp_list', vp_list)


class Index(View):
    template_name = 'cyberdevice/index.html'

    def _render(self, request):
        return render(
            request,
            self.template_name,
            {
                'da_list': da_list,
            }
        )

    def get(self, request, *args, **kwargs):
        return self._render(request)


class EcEndpoint(View):
    def get(self, request, *args, **kwargs):
        return JsonResponse({"ec_endpoint": settings.EC_ENDPOINT})


class CyberDevice(View):
    template_name = 'da/{}.html'

    def _render(self, request, da_name):
        return render(
            request,
            self.template_name.format(da_name),
            {
                'da_name': da_name,
                'ec_endpoint': settings.EC_ENDPOINT,
                'ag_endpoint': settings.AG_ENDPOINT,
                'ag_username': settings.AG_USERNAME,
                'ag_password': settings.AG_PASSWORD,
                'ag_access_token': settings.AG_ACCESS_TOKEN,
            }
        )

    def get(self, request, *args, **kwargs):
        da_name = self.kwargs['da_name']
        return self._render(request, da_name)


class VPython(View):
    template_name = 'vp/base.html'

    def _render(self, request, vp_name):
        return render(
            request,
            self.template_name,
            {
                'vp_name': vp_name,
                'ec_endpoint': settings.EC_ENDPOINT,
                'ag_endpoint': settings.AG_ENDPOINT,
                'ag_username': settings.AG_USERNAME,
                'ag_password': settings.AG_PASSWORD,
                'ag_access_token': settings.AG_ACCESS_TOKEN,
            }
        )

    def get(self, request, *args, **kwargs):
        vp_name = self.kwargs['vp_name']
        return self._render(request, vp_name)


class Smartphone(View):
    template_name = 'cyberdevice/smartphone.html'

    def _render(self, request, do_id):
        return render(
            request,
            self.template_name,
            {
                'ec_endpoint': settings.EC_ENDPOINT,
                'do_id': do_id,
            }
        )

    def get(self, request, *args, **kwargs):
        return self._render(request, self.kwargs['do_id'])
