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

extensions = ['sphinxcontrib.mermaid']

# Render the Event Codes diagrams in HTML, including the site's dark theme.
mermaid_version = '11.12.1'
mermaid_init_config = {'startOnLoad': False, 'securityLevel': 'strict'}
mermaid_height = 'auto'

templates_path = ['_templates']
exclude_patterns = [
    "_build",
    "Thumbs.db",
    ".DS_Store",
    # Windows NTFS / browser download sidecar files (not documentation sources)
    "**/*Zone.Identifier*",
    # Obsolete duplicate tree (canonical section is ``github_repositories/``).
    # List both plain and glob forms so nothing under ``osprey/`` is picked up on any OS.
    "osprey",
    "osprey/*",
    "osprey/**",
    "osprey/**/*.rst",
    # Legacy root wrappers (canonical copies live under ``internal/``).
    "daq_architecture_pdf.rst",
    "nsls2_timing_pdf.rst",
    # Legacy pages (replaced by the Guide-to-Guides structure)
    "overview.rst",
    "system_manual.rst",
    "dg645.rst",
    "quartz_board.rst",
]


def _emit_legacy_osprey_redirects(app, exception):
    """If an old ``osprey/`` tree was ever published, bookmarks still hit those URLs.

    After each HTML build, write small redirect pages under ``html/osprey/`` so
    ``…/osprey/quartz_vs_evt_timing.html`` resolves to ``github_repositories/…``.
    This runs even when duplicate RST was excluded, so incremental output stays safe.
    """
    if exception or app.builder is None or app.builder.name != "html":
        return
    import json
    from pathlib import Path

    out = Path(app.outdir)
    osprey_dir = out / "osprey"
    osprey_dir.mkdir(parents=True, exist_ok=True)

    def page(target_rel: str) -> str:
        target_js = json.dumps(target_rel)
        return (
            "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n"
            "  <meta charset=\"utf-8\">\n"
            f"  <meta http-equiv=\"refresh\" content=\"0; url={target_rel}\">\n"
            f"  <link rel=\"canonical\" href=\"{target_rel}\">\n"
            f"  <script>location.replace({target_js});</script>\n"
            "  <title>Moved</title>\n</head>\n<body>\n"
            f"  <p>This page moved. If you are not redirected, open "
            f"<a href=\"{target_rel}\">the new location</a>.</p>\n</body>\n</html>\n"
        )

    # Targets are relative to ``osprey/*.html`` → sibling ``github_repositories/``.
    mapping = {
        "index.html": "../github_repositories/index.html",
        "quartz_vs_evt_timing.html": "../github_repositories/quartz_vs_evt_timing.html",
        "bringup_procedures.html": "../github_repositories/bringup_procedures.html",
    }
    for filename, target in mapping.items():
        (osprey_dir / filename).write_text(page(target), encoding="utf-8")


def setup(app):
    app.connect("build-finished", _emit_legacy_osprey_redirects)


# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

# Browser tab <title> and Furo’s top-left sidebar label (see theme sidebar/brand.html).
html_title = f'{project} Docs'

html_theme = 'furo'
html_static_path = ['_static']

# Typography + sidebar tweaks on top of Furo (see _static/custom.css)
html_css_files = ['custom.css']

# Sphinx built-in (Sphinx 9 + strict theme.toml rejects these under html_theme_options for Furo)
pygments_style = 'default'

html_theme_options = {
    # Left sidebar: show project name
    'sidebar_hide_name': False,
    # j/k to move between sidebar items
    'navigation_with_keys': True,
}
