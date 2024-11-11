.PHONY: all backend frontend run

run:
	@echo "Starting backend and frontend concurrently..."
	@npx concurrently "cd backend && npm run start" "cd koira && npm run dev"