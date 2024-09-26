from pathlib import Path
from setuptools import setup

from jupyter_packaging import (
    create_cmdclass,
    install_npm,
    ensure_targets,
    combine_commands,
)


HERE = Path(__file__).parent

test_app_DIR = HERE / "test_app"

jstargets = [
    (test_app_DIR / "static" / "bundle.js").resolve(),
]

cmdclass = create_cmdclass("jsbuild", package_data_spec={"test_app": "**"})
cmdclass["jsbuild"] = combine_commands(
    install_npm(HERE.resolve(), npm=["jlpm"], build_cmd="build"), ensure_targets(jstargets),
)

setup(cmdclass=cmdclass)
