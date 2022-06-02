FROM python:3.7.10-slim

WORKDIR /cyberdevice

RUN apt update && \
    pip install --no-cache-dir -U pip && \
    apt autoremove -y && \
    rm -rf /var/lib/apt/lists/*

# BUILD STAGE
COPY ./ /cyberdevice

# install Frame Module
RUN pip install --no-cache-dir -r requirements.txt

