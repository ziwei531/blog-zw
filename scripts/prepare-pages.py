#!/usr/bin/env python3
"""Stamp deployed text assets with the current GitHub Pages build version."""

from pathlib import Path
import shutil
import sys

TOKEN = "__BUILD_VERSION__"
TEXT_SUFFIXES = { ".html", ".js", ".css", ".xml", ".json", ".txt" }


def main() -> None:
	output = Path( sys.argv[1] if len( sys.argv ) > 1 else "_site" )
	version = sys.argv[2] if len( sys.argv ) > 2 else "dev"

	if not output.exists():
		raise SystemExit( f"Build output does not exist: { output }" )

	replaced = 0
	for path in output.rglob( "*" ):
		if not path.is_file() or path.suffix not in TEXT_SUFFIXES:
			continue

		text = path.read_text( encoding="utf-8" )
		updated = text.replace( TOKEN, version )
		if updated != text:
			path.write_text( updated, encoding="utf-8" )
			replaced += 1

	for path in output.rglob( "*" ):
		if path.is_file() and path.suffix in TEXT_SUFFIXES:
			if TOKEN in path.read_text( encoding="utf-8" ):
				raise SystemExit( f"Unresolved build token in { path }" )

	print( f"Stamped { replaced } files in { output } with build version { version }" )


if __name__ == "__main__":
	main()
