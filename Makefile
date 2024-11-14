install:
	npm ci

lint:
	npx eslint .

develop:
	npx webpack serve

build:
	NODE_ENV=production npx webpack
