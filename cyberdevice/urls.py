"""djangoproject URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.9/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import url, include

from cyberdevice.views import CyberDevice, EcEndpoint, Index, Smartphone, VPython

urlpatterns = [
    url(r'^index/$', Index.as_view()),
    url(r'^ec_endpoint/', EcEndpoint.as_view()),
    url(r'^da/(?P<da_name>[\w-]+)/$', CyberDevice.as_view()),
    url(r'^vp/(?P<vp_name>[\w-]+)/$', VPython.as_view()),
    url(r'^smartphone/(?P<do_id>[0-9]+)/$', Smartphone.as_view()),
]
