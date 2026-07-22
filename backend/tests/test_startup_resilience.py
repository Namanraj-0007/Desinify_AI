import importlib
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))


def test_app_imports_without_mongo_dependency():
    sys.modules.pop('app.main', None)
    main_module = importlib.import_module('app.main')

    app = main_module.create_app()
    assert app is not None
