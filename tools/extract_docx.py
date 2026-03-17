from __future__ import annotations

import argparse
from pathlib import Path


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Extract plain text from .docx files into an output directory."
    )
    parser.add_argument(
        "inputs",
        nargs="+",
        help="One or more .docx files to extract text from.",
    )
    parser.add_argument(
        "--out-dir",
        default="docx_extract",
        help="Output directory for extracted .txt files (default: docx_extract).",
    )
    args = parser.parse_args()

    try:
        import docx2txt  # type: ignore
    except Exception as exc:  # pragma: no cover
        raise SystemExit(
            "Missing dependency 'docx2txt'. Install with: python -m pip install --user docx2txt"
        ) from exc

    out_dir = Path(args.out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    for raw in args.inputs:
        p = Path(raw)
        out_path = out_dir / f"{p.stem}.txt"
        try:
            text = docx2txt.process(str(p)) or ""
        except Exception as exc:
            text = f"ERROR extracting {p}: {exc}\n"
        out_path.write_text(text, encoding="utf-8", errors="replace")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())

