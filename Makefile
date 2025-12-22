.PHONY: help install generate migrate dev build start bot docker-build docker-up docker-down lint clean

.DEFAULT_GOAL := help

help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Development targets:"
	@echo "  install        Install npm dependencies"
	@echo "  generate       Generate Prisma client"
	@echo "  migrate        Run database migrations"
	@echo "  dev            Start Next.js development server"
	@echo "  bot            Start Telegram bot"
	@echo "  build          Build Next.js for production"
	@echo "  start          Start Next.js production server"
	@echo ""
	@echo "Docker targets:"
	@echo "  docker-build   Build Docker images"
	@echo "  docker-up      Start Docker containers in background"
	@echo "  docker-down    Stop and remove Docker containers"
	@echo ""
	@echo "Utility targets:"
	@echo "  lint           Run ESLint"
	@echo "  clean          Remove build artifacts and node_modules"

install:
	npm install

generate:
	npx prisma generate

migrate:
	npx prisma migrate dev

dev:
	npm run dev

bot:
	npm run bot

db:
	docker compose run db -d

build:
	npm run build

start:
	npm run start

docker-build:
	docker compose build

docker-up:
	docker compose up -d

docker-down:
	docker compose down

clean:
	rm -rf .next node_modules