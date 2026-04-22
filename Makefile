# Minimal makefile for Sphinx documentation
#

# You can set these variables from the command line, and also
# from the environment for the first two.
SPHINXOPTS    ?=
SPHINXBUILD   ?= sphinx-build
SPHINXAUTOBUILD ?= sphinx-autobuild
SOURCEDIR     = source
BUILDDIR      = build
LIVEPORT      ?= 8000

# Put it first so that "make" without argument is like "make help".
help:
	@$(SPHINXBUILD) -M help "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS) $(O)

# Live HTML: rebuild on save + local server.
# Default uses ``-a`` (write all HTML): Furo embeds the sidebar in every page, so incremental
# builds otherwise leave *unchanged* pages showing stale nav titles until each file is rebuilt.
# WATCHFILES_FORCE_POLLING=1 fixes missed saves on WSL/UNC/network paths.
.PHONY: livehtml livehtml-fast livehtml-all livehtml-fresh
livehtml:
	WATCHFILES_FORCE_POLLING=1 $(SPHINXAUTOBUILD) -b html -a "$(SOURCEDIR)" "$(BUILDDIR)/html" --port $(LIVEPORT) --open-browser

# Faster dev: only HTML for files Sphinx thinks changed (sidebar can lag after title/toctree edits).
livehtml-fast:
	WATCHFILES_FORCE_POLLING=1 $(SPHINXAUTOBUILD) -b html "$(SOURCEDIR)" "$(BUILDDIR)/html" --port $(LIVEPORT) --open-browser

# Same as ``livehtml`` (kept for people who memorized the old name).
livehtml-all: livehtml

# Fresh environment + all HTML (use if doctree/metadata still looks wrong after ``livehtml``).
livehtml-fresh:
	WATCHFILES_FORCE_POLLING=1 $(SPHINXAUTOBUILD) -b html -E -a "$(SOURCEDIR)" "$(BUILDDIR)/html" --port $(LIVEPORT) --open-browser

.PHONY: help Makefile

# Catch-all target: route all unknown targets to Sphinx using the new
# "make mode" option.  $(O) is meant as a shortcut for $(SPHINXOPTS).
%: Makefile
	@$(SPHINXBUILD) -M $@ "$(SOURCEDIR)" "$(BUILDDIR)" $(SPHINXOPTS) $(O)
