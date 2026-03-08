.PHONY: build test dev clean demo-setup demo-teardown

build:
	npm run build

test:
	npm run test

test-coverage:
	npm run test:coverage

dev:
	npm run dev

clean:
	rm -rf dist node_modules

install:
	npm install

typecheck:
	npm run typecheck

demo-setup:
	bash demo/demo-cluster/setup.sh

demo-teardown:
	minikube delete
