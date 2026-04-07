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

# Browser tab <title> and Furo’s top-left sidebar label (see theme sidebar/brand.html).
html_title = f'{project} Docs'

html_theme = 'furo'
html_static_path = ['_static']

# Typography + sidebar tweaks on top of Furo (see _static/custom.css)
html_css_files = ['custom.css']

html_theme_options = {
    # Left sidebar: show project name
    'sidebar_hide_name': False,
    # j/k to move between sidebar items
    'navigation_with_keys': True,
    # Right-hand page TOC heading
    'toc_title': 'On this page',
    'pygments_light_style': 'default',
    'pygments_dark_style': 'monokai',
}
