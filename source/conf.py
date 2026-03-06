# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

project = 'CXFEL'
copyright = "2026, Dario D'Addamio"
author = "Dario D'Addamio"

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

extensions = []

templates_path = ['_templates']
exclude_patterns = [
    "_build",
    "Thumbs.db",
    ".DS_Store",
    # Legacy pages (replaced by the Guide-to-Guides structure)
    "overview.rst",
    "system_manual.rst",
    "dg645.rst",
    "quartz_board.rst",
]



# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

html_theme = 'alabaster'
html_static_path = ['_static']

# Load local overrides (e.g. font tweaks) from _static/custom.css
html_css_files = ['custom.css']

# Sidebar/navigation behavior (Alabaster)
html_theme_options = {
    # Show hidden toctree entries in the sidebar (we keep toctrees hidden on pages).
    "globaltoc_includehidden": True,
    # Do NOT auto-collapse other branches; keep the full tree visible so
    # dropdowns are always available.
    "sidebar_collapse": False,
}

# Add a tiny sidebar script to collapse/expand nested nav items.
html_js_files = ["nav.js"]
