pages   := $(shell find . -type f -name '*.adoc')

# Determine whether to use podman
#
# podman currently fails when executing in GitHub actions on Ubuntu LTS 20.04,
# so we never use podman if GITHUB_ACTIONS==true.
use_podman := $(shell command -v podman 2>&1 >/dev/null; p="$$?"; \
		if [ "$${GITHUB_ACTIONS}" != "true" ]; then echo "$$p"; else echo 1; fi)

ifeq ($(use_podman),0)
	engine_cmd  ?= podman
	engine_opts ?= --rm --tty --userns=keep-id
else
	engine_cmd  ?= docker
	engine_opts ?= --rm --tty --user "$$(id -u)"
endif

preview_cmd ?= docker run --rm --publish 35729:35729 --publish 2020:2020 --volume "${PWD}":/preview/antora vshn/antora-preview:3.0.1.1 --antora=docs --style=appuio
vale_cmd ?= $(engine_cmd) run $(engine_opts) --volume "$${PWD}"/docs/modules:/pages:Z docker.io/vshn/vale:2.10.5.1 --minAlertLevel=error --config=/pages/ROOT/pages/.vale.ini /pages

UNAME := $(shell uname)
ifeq ($(UNAME), Linux)
	OS = linux-x64
	OPEN = xdg-open
endif
ifeq ($(UNAME), Darwin)
	OS = darwin-x64
	OPEN = open
endif

.PHONY: check
check: ## Run vale agains the documentation to check writing style
	$(vale_cmd)

.PHONY: preview
preview: ## Start the preview server with live reload capabilities, available under http://localhost:2020
	$(preview_cmd)

.PHONY: help
help: ## Show this help
	@grep -E -h '\s##\s' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'
