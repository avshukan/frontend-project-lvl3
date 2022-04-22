build:
	npm run build

install:
	npm ci

lint:
	npx eslint .

lint-fix:
	npx eslint . --fix

start:
	npm start

test:
	npm test

test-coverage:
	npm test -- --coverage --coverageProvider=v8