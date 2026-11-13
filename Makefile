.PHONY: help setup dev test lint fmt build clean

help: ## List available commands
	@awk 'BEGIN {FS = ":.*## "} /^[a-zA-Z_-]+:.*## / {printf "%-12s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

setup: ## Install locked dependencies (Node.js 24 recommended)
	npm --prefix site ci

dev: ## Start the Astro development server
	npm --prefix site run dev

test: ## Build and check all local page links, anchors, and assets
	npm --prefix site test

lint: ## Check source formatting
	npm --prefix site run lint

fmt: ## Format source files
	npm --prefix site run fmt

build: ## Build the static site in site/dist
	npm --prefix site run build

clean: ## Remove generated output and Astro cache
	rm -rf site/dist site/.astro
