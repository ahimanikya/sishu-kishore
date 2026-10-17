"""Apply the preserved editorial source for the six-world Odia-first edition."""
from pathlib import Path
import os, runpy
repository=Path(__file__).resolve().parents[1]
default=repository.parent/'business-review/sishu-kishore/2026-10-17/odia-heritage-revision'
source=Path(os.environ.get('CHARACTER_HERITAGE_SOURCE',str(default)))
script=source/'support/build_heritage.py'
if not script.is_file():
    raise SystemExit('The preserved heritage editorial source is required. Set CHARACTER_HERITAGE_SOURCE to its folder. See CHARACTERS-HERITAGE.txt.')
runpy.run_path(str(script),run_name='__main__')
runpy.run_path(str(repository/'scripts/apply-character-credit.py'),run_name='__main__')
