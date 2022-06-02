make: build
	docker-compose up -d

build:
	docker-compose build

log:
	docker-compose logs -f --tail=50 cyberdevice
